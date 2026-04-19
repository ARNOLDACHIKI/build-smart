import TabCollectionView from '../TabCollectionView';
import { localArticles } from '../data';
import { filterBySearch, sortByPersona } from '../tabUtils';
import type { TabComponentProps } from './types';

const ArticlesTab = ({
  persona,
  search,
  density,
  isMutating,
  bookmarks,
  follows,
  votes,
  onBookmark,
  onFollow,
  onVote,
}: TabComponentProps) => {
  const items = filterBySearch(sortByPersona(localArticles, persona), search);

  return (
    <TabCollectionView
      items={items}
      density={density}
      isLoading={false}
      isMutating={isMutating}
      bookmarks={bookmarks}
      follows={follows}
      votes={votes}
      onBookmark={onBookmark}
      onFollow={onFollow}
      onVote={onVote}
    />
  );
};

export default ArticlesTab;
