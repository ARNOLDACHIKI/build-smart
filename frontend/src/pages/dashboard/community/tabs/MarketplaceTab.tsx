import TabCollectionView from '../TabCollectionView';
import { marketplaceItems } from '../data';
import { filterBySearch, sortByPersona } from '../tabUtils';
import type { TabComponentProps } from './types';

const MarketplaceTab = ({
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
  const items = filterBySearch(sortByPersona(marketplaceItems, persona), search);

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

export default MarketplaceTab;
