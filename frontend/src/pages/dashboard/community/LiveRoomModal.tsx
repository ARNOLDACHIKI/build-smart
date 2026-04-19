import { useEffect, useRef, useState } from 'react';
import { Users, VideoOff } from 'lucide-react';
import { authStorage } from '@/lib/auth';
import {
  getCommunityLiveArchive,
  getCommunityLiveIceConfig,
  getCommunityLiveRoomPresence,
  getCommunityLiveSignals,
  joinCommunityLiveRoom,
  leaveCommunityLiveRoom,
  startCommunityLiveRecording,
  stopCommunityLiveRecording,
  submitCommunityLiveTranscript,
  uploadCommunityLiveRecording,
  sendCommunityLiveSignal,
  updateCommunityLiveRoomAccess,
  type CommunityLiveRoomRecording,
  type CommunityRecordingAsset,
  type CommunityLiveRoomParticipant,
  type CommunityLiveRoomSignal,
  type CommunityTranscriptEntry,
} from '@/lib/community';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type LiveSessionPayload = {
  title: string;
  roomId?: string;
};

type LiveRoomModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: LiveSessionPayload | null;
};

const FALLBACK_ICE: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const LiveRoomModal = ({ open, onOpenChange, session }: LiveRoomModalProps) => {
  const { toast } = useToast();

  const [participants, setParticipants] = useState<CommunityLiveRoomParticipant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>(FALLBACK_ICE);
  const [roomLocked, setRoomLocked] = useState(false);
  const [canModerate, setCanModerate] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [recording, setRecording] = useState<CommunityLiveRoomRecording>({
    isRecording: false,
    startedAt: null,
    startedByParticipantId: null,
    stoppedAt: null,
  });
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptEntries, setTranscriptEntries] = useState<CommunityTranscriptEntry[]>([]);
  const [recordingAssets, setRecordingAssets] = useState<CommunityRecordingAsset[]>([]);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const rtcConfigRef = useRef<RTCConfiguration>(FALLBACK_ICE);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const presenceTimerRef = useRef<number | null>(null);
  const archiveTimerRef = useRef<number | null>(null);
  const latestSeqRef = useRef(0);
  const participantIdRef = useRef<string | null>(null);

  const roomId = session?.roomId;

  const stopPolling = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (presenceTimerRef.current) {
      window.clearInterval(presenceTimerRef.current);
      presenceTimerRef.current = null;
    }
    if (archiveTimerRef.current) {
      window.clearInterval(archiveTimerRef.current);
      archiveTimerRef.current = null;
    }
  };

  const closePeer = (peerId: string) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      peer.close();
      peersRef.current.delete(peerId);
    }

    setRemoteStreams((current) => {
      const next = { ...current };
      delete next[peerId];
      return next;
    });
  };

  const teardownMedia = () => {
    stopPolling();

    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    setRemoteStreams({});

    if (localStreamRef.current) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      mediaChunksRef.current = [];
      recordingStartedAtRef.current = null;
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    latestSeqRef.current = 0;
    setParticipants([]);
    setParticipantId(null);
    setRoomLocked(false);
    setCanModerate(false);
    setIsHost(false);
    setRecording({
      isRecording: false,
      startedAt: null,
      startedByParticipantId: null,
      stoppedAt: null,
    });
    setTranscriptEntries([]);
    setRecordingAssets([]);
    setTranscriptText('');
    participantIdRef.current = null;
  };

  const createPeerConnection = async (targetParticipantId: string, shouldInitiateOffer: boolean) => {
    const currentParticipantId = participantIdRef.current;
    if (!currentParticipantId) return;
    if (peersRef.current.has(targetParticipantId)) return;

    const peer = new RTCPeerConnection(rtcConfigRef.current);
    peersRef.current.set(targetParticipantId, peer);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate || !roomId || !currentParticipantId) return;
      void sendCommunityLiveSignal(roomId, {
        fromParticipantId: currentParticipantId,
        toParticipantId: targetParticipantId,
        type: 'ice-candidate',
        payload: {
          candidate: event.candidate,
        },
      }).catch(() => undefined);
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      setRemoteStreams((current) => ({ ...current, [targetParticipantId]: stream }));
    };

    if (shouldInitiateOffer && roomId && currentParticipantId) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      await sendCommunityLiveSignal(roomId, {
        fromParticipantId: currentParticipantId,
        toParticipantId: targetParticipantId,
        type: 'offer',
        payload: { sdp: offer },
      });
    }
  };

  const processSignal = async (signal: CommunityLiveRoomSignal) => {
    const currentParticipantId = participantIdRef.current;
    if (!currentParticipantId || !roomId) return;

    if (signal.type === 'participant-joined') {
      const joinedParticipantId = String(signal.payload?.participantId || '');
      if (joinedParticipantId && joinedParticipantId !== currentParticipantId) {
        await createPeerConnection(joinedParticipantId, true);
      }
      return;
    }

    if (signal.type === 'participant-left') {
      const leftParticipantId = String(signal.payload?.participantId || signal.fromParticipantId || '');
      if (leftParticipantId) {
        closePeer(leftParticipantId);
      }
      return;
    }

    const fromParticipantId = signal.fromParticipantId;
    if (!fromParticipantId || fromParticipantId === currentParticipantId) return;

    let peer = peersRef.current.get(fromParticipantId);
    if (!peer) {
      await createPeerConnection(fromParticipantId, false);
      peer = peersRef.current.get(fromParticipantId);
    }

    if (!peer) return;

    if (signal.type === 'offer') {
      const offer = signal.payload?.sdp as RTCSessionDescriptionInit | undefined;
      if (!offer) return;

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      await sendCommunityLiveSignal(roomId, {
        fromParticipantId: currentParticipantId,
        toParticipantId: fromParticipantId,
        type: 'answer',
        payload: { sdp: answer },
      });
      return;
    }

    if (signal.type === 'answer') {
      const answer = signal.payload?.sdp as RTCSessionDescriptionInit | undefined;
      if (!answer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      return;
    }

    if (signal.type === 'ice-candidate') {
      const candidate = signal.payload?.candidate as RTCIceCandidateInit | undefined;
      if (!candidate) return;
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  useEffect(() => {
    if (!open || !roomId) {
      teardownMedia();
      return;
    }

    let isCancelled = false;

    const start = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isCancelled) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const iceConfig = await getCommunityLiveIceConfig().catch(() => ({ iceServers: FALLBACK_ICE.iceServers || [] }));
        const nextRtcConfig: RTCConfiguration = {
          iceServers: iceConfig.iceServers.length > 0 ? iceConfig.iceServers : FALLBACK_ICE.iceServers,
        };
        setRtcConfig(nextRtcConfig);
        rtcConfigRef.current = nextRtcConfig;

        const authUser = authStorage.getUser();
        const displayName = authUser?.name || authUser?.email?.split('@')[0] || 'Community member';
        const joined = await joinCommunityLiveRoom(roomId, displayName);

        if (isCancelled) return;

        setParticipantId(joined.participantId);
        participantIdRef.current = joined.participantId;
        setParticipants(joined.participants);
        setRoomLocked(joined.roomLocked);
        setCanModerate(joined.canModerate);
        setIsHost(joined.isHost);
        setRecording(joined.recording);

        const archive = await getCommunityLiveArchive(roomId).catch(() => null);
        if (archive) {
          setTranscriptEntries(archive.transcript);
          setRecordingAssets(archive.recordings);
          setRecording(archive.recording);
        }

        const peersToCall = joined.participants
          .map((participant) => participant.participantId)
          .filter((peerId) => peerId !== joined.participantId);

        for (const peerId of peersToCall) {
          await createPeerConnection(peerId, true);
        }

        pollTimerRef.current = window.setInterval(() => {
          void getCommunityLiveSignals(roomId, joined.participantId, latestSeqRef.current)
            .then(async (response) => {
              latestSeqRef.current = response.latestSeq;
              for (const signal of response.signals) {
                await processSignal(signal);
              }
            })
            .catch(() => undefined);
        }, 1000);

        presenceTimerRef.current = window.setInterval(() => {
          void getCommunityLiveRoomPresence(roomId, joined.participantId)
            .then((presence) => {
              setParticipants(presence.participants);
              setRoomLocked(presence.roomLocked);
              setCanModerate(presence.canModerate);
              setIsHost(presence.isHost);
              setRecording(presence.recording);
            })
            .catch(() => undefined);
        }, 4000);

        archiveTimerRef.current = window.setInterval(() => {
          void getCommunityLiveArchive(roomId)
            .then((archivePayload) => {
              setTranscriptEntries(archivePayload.transcript);
              setRecordingAssets(archivePayload.recordings);
              setRecording(archivePayload.recording);
            })
            .catch(() => undefined);
        }, 6000);
      } catch (error) {
        toast({
          title: 'Unable to start live room',
          description: error instanceof Error ? error.message : 'Please check camera/microphone permissions.',
          variant: 'destructive',
        });
        onOpenChange(false);
      }
    };

    void start();

    return () => {
      isCancelled = true;
      const currentParticipantId = participantIdRef.current;
      if (roomId && currentParticipantId) {
        void leaveCommunityLiveRoom(roomId, currentParticipantId).catch(() => undefined);
      }
      teardownMedia();
    };
  }, [open, roomId]);

  const toggleRoomLock = async () => {
    if (!roomId || !canModerate) return;
    try {
      const result = await updateCommunityLiveRoomAccess(roomId, { lock: !roomLocked, allowGuestJoin: false });
      setRoomLocked(result.roomLocked);
      toast({ title: result.roomLocked ? 'Room locked' : 'Room unlocked' });
    } catch (error) {
      toast({
        title: 'Unable to update room lock',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleRecording = async () => {
    if (!roomId || !canModerate || !participantId) return;
    try {
      if (recording.isRecording) {
        const recorder = mediaRecorderRef.current;
        const recordedBlob = await new Promise<Blob | null>((resolve) => {
          if (!recorder || recorder.state === 'inactive') {
            resolve(null);
            return;
          }

          recorder.onstop = () => {
            const blob = mediaChunksRef.current.length > 0 ? new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'video/webm' }) : null;
            resolve(blob);
          };

          recorder.stop();
        });

        const result = await stopCommunityLiveRecording(roomId);
        setRecording(result.recording);

        if (recordedBlob && recordedBlob.size > 0) {
          const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : undefined;
          const extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
          const upload = await uploadCommunityLiveRecording(roomId, {
            participantId,
            recordingBlob: recordedBlob,
            fileName: `live-room-${roomId}-${Date.now()}.${extension}`,
            durationMs,
          });
          setRecordingAssets((current) => [...current, upload.recording].slice(-50));
        }

        mediaChunksRef.current = [];
        recordingStartedAtRef.current = null;
        toast({ title: 'Recording stopped' });
      } else {
        if (!localStreamRef.current) {
          throw new Error('Local media stream not available for recording.');
        }

        const mimeCandidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        const mimeType = mimeCandidates.find((candidate) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate));
        const recorder = new MediaRecorder(localStreamRef.current, mimeType ? { mimeType } : undefined);
        mediaChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            mediaChunksRef.current.push(event.data);
          }
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        recordingStartedAtRef.current = Date.now();

        const result = await startCommunityLiveRecording(roomId, participantId);
        setRecording(result.recording);
        toast({ title: 'Recording started' });
      }
    } catch (error) {
      toast({
        title: 'Unable to update recording state',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const submitTranscript = async () => {
    if (!roomId || !participantId || !transcriptText.trim()) return;
    try {
      setIsSavingTranscript(true);
      const result = await submitCommunityLiveTranscript(roomId, {
        participantId,
        text: transcriptText.trim(),
      });
      setTranscriptEntries((current) => [...current, result.entry].slice(-200));
      setTranscriptText('');
    } catch (error) {
      toast({
        title: 'Unable to save transcript',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTranscript(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-hairline h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session?.title || 'Live Room'}</DialogTitle>
          <DialogDescription>
            Real-time room with WebRTC media and live participant presence.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">{participants.length} participant(s)</span>
          <Badge variant={roomLocked ? 'destructive' : 'secondary'}>{roomLocked ? 'Locked room' : 'Open room'}</Badge>
          <Badge variant="outline">{isHost ? 'Host' : canModerate ? 'Moderator' : 'Participant'}</Badge>
          <Badge variant={recording.isRecording ? 'default' : 'outline'}>{recording.isRecording ? 'Recording' : 'Not recording'}</Badge>
          <div className="flex flex-wrap gap-1.5">
            {participants.slice(0, 6).map((participant) => (
              <Badge key={participant.participantId} variant="secondary">
                {participant.displayName}
              </Badge>
            ))}
          </div>
        </div>

        {canModerate && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={roomLocked ? 'destructive' : 'outline'} onClick={() => void toggleRoomLock()}>
              {roomLocked ? 'Unlock room' : 'Lock room'}
            </Button>
            <Button size="sm" variant={recording.isRecording ? 'destructive' : 'default'} onClick={() => void toggleRecording()}>
              {recording.isRecording ? 'Stop recording' : 'Start recording'}
            </Button>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-background/80">
            <video ref={localVideoRef} autoPlay muted playsInline className="h-56 w-full bg-black object-cover" />
            <div className="px-3 py-2 text-xs text-muted-foreground">You</div>
          </div>

          {Object.entries(remoteStreams).map(([peerId, stream]) => (
            <div key={peerId} className="overflow-hidden rounded-xl border border-border/50 bg-background/80">
              <video
                autoPlay
                playsInline
                className="h-56 w-full bg-black object-cover"
                ref={(node) => {
                  if (node) node.srcObject = stream;
                }}
              />
              <div className="px-3 py-2 text-xs text-muted-foreground">
                {participants.find((participant) => participant.participantId === peerId)?.displayName || peerId}
              </div>
            </div>
          ))}

          {Object.keys(remoteStreams).length === 0 && (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground">
              <VideoOff className="mr-2 h-4 w-4" /> Waiting for others to join...
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium">Transcript notes</p>
            <Textarea
              value={transcriptText}
              onChange={(event) => setTranscriptText(event.target.value)}
              placeholder="Add an important discussion note or transcript snippet"
              rows={3}
            />
            <Button size="sm" onClick={() => void submitTranscript()} disabled={isSavingTranscript || !transcriptText.trim()}>
              Save transcript note
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Session archive</p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3">
              {transcriptEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No transcript notes yet.</p>
              ) : (
                transcriptEntries.slice(-20).map((entry) => (
                  <div key={entry.id} className="rounded-md border border-border/50 bg-muted/20 px-2 py-1.5 text-xs">
                    <p className="font-medium">{entry.author}</p>
                    <p className="text-muted-foreground">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Uploaded recordings</p>
              <div className="max-h-36 space-y-2 overflow-y-auto">
                {recordingAssets.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recordings uploaded yet.</p>
                ) : (
                  recordingAssets.slice(-20).map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-border/50 bg-muted/20 px-2 py-1.5 text-xs hover:bg-muted/30"
                    >
                      <p className="font-medium">{asset.author}</p>
                      <p className="text-muted-foreground">{asset.fileName}</p>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveRoomModal;
