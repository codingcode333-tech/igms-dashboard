import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
  Select,
  Option,
  Chip,
  Spinner
} from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import searchService, { SEARCH_TYPES } from '@/services/searchService';
import GrievanceList from '@/widgets/grievance/list';

export function SearchGrievances() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState(SEARCH_TYPES.SEMANTIC);
  const [threshold, setThreshold] = useState(1.5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const searchTypeLabels = {
    [SEARCH_TYPES.SEMANTIC]: 'Semantic Search',
    [SEARCH_TYPES.KEYWORD]: 'Keyword Search',
    [SEARCH_TYPES.HYBRID]: 'Hybrid Search'
  };

  const handleSearch = async (page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setCurrentPage(page);

    try {
      const result = await searchService.searchGrievances({
        query: query.trim(),
        value: searchType,
        skiprecord: (page - 1) * pageSize,
        size: pageSize,
        threshold: threshold
      });

      if (result.success) {
        setResults(result.grievances);
        setTotalCount(result.totalCount);
      } else {
        console.error('Search failed:', result.error);
        setResults([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    handleSearch(page);
  };

  return (
    <div className="mt-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Search Grievances
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Search through grievances using semantic, keyword, or hybrid search
          </Typography>
        </CardHeader>
        <CardBody>
          {/* Search Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="Search Query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  placeholder="Enter your search query..."
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={!query.trim() || loading}
                className="flex items-center gap-2"
              >
                {loading ? <Spinner className="h-4 w-4" /> : <MagnifyingGlassIcon className="h-4 w-4" />}
                Search
              </Button>
            </div>

            <div className="flex gap-4 items-end">
              <div className="w-64">
                <Select
                  label="Search Type"
                  value={searchType.toString()}
                  onChange={(value) => setSearchType(parseInt(value))}
                >
                  <Option value={SEARCH_TYPES.SEMANTIC.toString()}>
                    Semantic Search
                  </Option>
                  <Option value={SEARCH_TYPES.KEYWORD.toString()}>
                    Keyword Search
                  </Option>
                  <Option value={SEARCH_TYPES.HYBRID.toString()}>
                    Hybrid Search
                  </Option>
                </Select>
              </div>

              <div className="w-48">
                <Input
                  type="number"
                  label="Relevance Threshold"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value) || 1.5)}
                  step="0.1"
                  min="0.1"
                  max="5.0"
                />
              </div>

              <div className="w-32">
                <Select
                  label="Page Size"
                  value={pageSize.toString()}
                  onChange={(value) => setPageSize(parseInt(value))}
                >
                  <Option value="10">10</Option>
                  <Option value="20">20</Option>
                  <Option value="50">50</Option>
                  <Option value="100">100</Option>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Info */}
          {query && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Chip
                variant="ghost"
                color="blue"
                value={`Query: "${query}"`}
              />
              <Chip
                variant="ghost"
                color="green"
                value={`Type: ${searchTypeLabels[searchType]}`}
              />
              <Chip
                variant="ghost"
                color="orange"
                value={`Threshold: ${threshold}`}
              />
              {totalCount > 0 && (
                <Chip
                  variant="ghost"
                  color="purple"
                  value={`Found: ${totalCount.toLocaleString()} results`}
                />
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8" />
              <Typography className="ml-2">Searching...</Typography>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <GrievanceList
              grievances={results}
              count={results.length}
              total={totalCount}
              pageno={currentPage}
              setPageno={handlePageChange}
              searching={false}
            />
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && totalCount === 0 && (
            <div className="text-center py-8">
              <Typography variant="h6" color="gray">
                No results found
              </Typography>
              <Typography color="gray" className="mt-2">
                Try adjusting your search query, type, or threshold
              </Typography>
            </div>
          )}

          {/* Search Instructions */}
          {!query && (
            <div className="bg-blue-gray-50 p-6 rounded-lg">
              <Typography variant="h6" className="mb-3">
                Search Types:
              </Typography>
              <div className="space-y-2">
                <div>
                  <Typography variant="small" className="font-semibold">
                    Semantic Search:
                  </Typography>
                  <Typography variant="small" color="gray">
                    Finds grievances with similar meaning and context
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="font-semibold">
                    Keyword Search:
                  </Typography>
                  <Typography variant="small" color="gray">
                    Finds grievances containing exact keywords
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="font-semibold">
                    Hybrid Search:
                  </Typography>
                  <Typography variant="small" color="gray">
                    Combines semantic and keyword search for best results
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default SearchGrievances;
