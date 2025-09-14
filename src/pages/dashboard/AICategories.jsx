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
  Textarea,
  Alert,
  Spinner,
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from '@material-tailwind/react';
import { CubeTransparentIcon, SparklesIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import searchService from '@/services/searchService';
import { getAICategories } from '@/services/category';

export function AICategories() {
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState({
    startdate: '2024-01-01',
    enddate: '2024-12-31',
    ministry: 'DOCAF',
    rcadata: {
      words: [],
      count: 0,
      doc_ids: []
    }
  });

  const [rcaText, setRcaText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // New state for historical categories
  const [historicalCategories, setHistoricalCategories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const ministries = [
    'DOCAF', 'AYUSH', 'DARPG/D', 'Education', 'Health', 
    'Railways', 'Telecom', 'Banking', 'Insurance', 'Other'
  ];

  // Load historical categories when component mounts or when tab changes
  useEffect(() => {
    if (activeTab === "history") {
      loadHistoricalCategories();
    }
  }, [activeTab]);

  const loadHistoricalCategories = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const response = await getAICategories();
      if (response.data && response.data.categories) {
        setHistoricalCategories(response.data.categories);
      } else {
        setHistoricalCategories([]);
      }
    } catch (err) {
      setHistoryError('Failed to load historical categories');
      console.error('Error loading historical categories:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseRCAData = (text) => {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(text);
      if (parsed.words && parsed.count !== undefined && parsed.doc_ids) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, treat as comma-separated words
      const words = text.split(',').map(w => w.trim()).filter(w => w);
      return {
        words: words,
        count: words.length,
        doc_ids: words.map((_, index) => `doc_${index + 1}`)
      };
    }
    
    // Default structure
    return {
      words: [],
      count: 0,
      doc_ids: []
    };
  };

  const handleRCATextChange = (text) => {
    setRcaText(text);
    const parsed = parseRCAData(text);
    setFormData(prev => ({
      ...prev,
      rcadata: parsed
    }));
  };

  const handleGenerate = async () => {
    if (!formData.rcadata.words.length) {
      setError('Please provide RCA data (words, topics, or JSON)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await searchService.generateAICategories(formData);
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error?.error || response.error || 'Failed to generate categories');
      }
    } catch (err) {
      setError('Network error or server unavailable');
      console.error('AI Categories Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.error) {
      return (
        <Alert color="red" className="mt-4">
          <Typography variant="small">
            <strong>API Error:</strong> {result.error}
          </Typography>
        </Alert>
      );
    }

    return (
      <Card className="mt-6">
        <CardHeader variant="gradient" color="green" className="mb-4 p-4">
          <Typography variant="h6" color="white">
            AI Generated Categories
          </Typography>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {Object.entries(result).map(([key, value]) => (
              <div key={key} className="border-l-4 border-green-500 pl-4">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(value) ? (
                    value.map((item, index) => (
                      <Chip
                        key={index}
                        variant="ghost"
                        color="green"
                        value={typeof item === 'string' ? item : JSON.stringify(item)}
                        className="text-xs"
                      />
                    ))
                  ) : typeof value === 'object' ? (
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <Typography variant="small" color="gray">
                      {String(value)}
                    </Typography>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderHistoricalCategories = () => {
    return (
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <Typography variant="h6" color="blue-gray">
            Historical AI Categories
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            onClick={loadHistoricalCategories}
            disabled={loadingHistory}
            className="flex items-center gap-2"
          >
            {loadingHistory ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <ClockIcon className="h-4 w-4" />
            )}
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
            <Typography variant="small" className="ml-3">
              Loading historical categories...
            </Typography>
          </div>
        ) : historyError ? (
          <Alert color="red" className="mt-4">
            <Typography variant="small">
              <strong>Error:</strong> {historyError}
            </Typography>
          </Alert>
        ) : !historicalCategories || historicalCategories.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="h6" color="gray">
              No historical AI categories found
            </Typography>
            <Typography variant="small" color="gray" className="mt-2">
              Generate some categories first to see them here
            </Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {historicalCategories.map((category, index) => (
              <Card key={category.idx || index} className="shadow-sm">
                <CardHeader variant="gradient" color="blue-gray" className="mb-4 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Typography variant="h6" color="white">
                        {category.ministry} - Category {category.idx}
                      </Typography>
                      <Typography variant="small" color="white" className="opacity-80">
                        {category.start_date} to {category.end_date}
                      </Typography>
                    </div>
                    <Chip
                      value={`ID: ${category.idx}`}
                      variant="ghost"
                      color="white"
                      className="text-white"
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  {category.rcadata && (
                    <div>
                      <Typography variant="h6" className="mb-3 flex items-center gap-2">
                        <EyeIcon className="h-5 w-5" />
                        Category Structure:
                      </Typography>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(JSON.parse(category.rcadata), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <Card>
        <CardHeader variant="gradient" color="purple" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            AI Category Management
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Generate AI-powered topic labels and view historical categories
          </Typography>
        </CardHeader>
        <CardBody>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabsHeader className="grid w-full grid-cols-2">
              <Tab value="generate">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5" />
                  Generate Categories
                </div>
              </Tab>
              <Tab value="history">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Historical Categories
                </div>
              </Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value="generate">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date Range */}
            <div>
              <Input
                label="Start Date"
                type="date"
                value={formData.startdate}
                onChange={(e) => handleInputChange('startdate', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="End Date"
                type="date"
                value={formData.enddate}
                onChange={(e) => handleInputChange('enddate', e.target.value)}
              />
            </div>

            {/* Ministry Selection */}
            <div className="md:col-span-2">
              <Select
                label="Ministry/Department"
                value={formData.ministry}
                onChange={(value) => handleInputChange('ministry', value)}
              >
                {ministries.map((ministry) => (
                  <Option key={ministry} value={ministry}>
                    {ministry}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* RCA Data Input */}
          <div className="mb-6">
            <Typography variant="h6" color="blue-gray" className="mb-3">
              RCA Data Input
            </Typography>
            <Textarea
              label="RCA Data (JSON format or comma-separated words)"
              placeholder={`Example JSON:\n{\n  "words": ["electricity", "billing", "complaint"],\n  "count": 3,\n  "doc_ids": ["doc1", "doc2", "doc3"]\n}\n\nOr simple: electricity, billing, complaint, service`}
              value={rcaText}
              onChange={(e) => handleRCATextChange(e.target.value)}
              rows={8}
            />
            
            {formData.rcadata.words.length > 0 && (
              <div className="mt-3">
                <Typography variant="small" color="blue-gray" className="mb-2">
                  Parsed Words ({formData.rcadata.count}):
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {formData.rcadata.words.slice(0, 10).map((word, index) => (
                    <Chip
                      key={index}
                      variant="ghost"
                      color="blue"
                      value={word}
                      size="sm"
                    />
                  ))}
                  {formData.rcadata.words.length > 10 && (
                    <Chip
                      variant="ghost"
                      color="gray"
                      value={`+${formData.rcadata.words.length - 10} more`}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert color="red" className="mb-4">
              <Typography variant="small">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !formData.rcadata.words.length}
            className="flex items-center gap-2 w-full md:w-auto"
            color="purple"
          >
            {loading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <SparklesIcon className="h-4 w-4" />
            )}
            {loading ? 'Generating Categories...' : 'Generate AI Categories'}
          </Button>

          {/* Results */}
          {renderResult()}

          {/* Instructions */}
          <div className="mt-8 bg-blue-gray-50 p-6 rounded-lg">
            <Typography variant="h6" className="mb-3 flex items-center gap-2">
              <CubeTransparentIcon className="h-5 w-5" />
              How to Use:
            </Typography>
            <div className="space-y-2 text-sm">
              <div>
                <Typography variant="small" className="font-semibold">
                  RCA Data Format:
                </Typography>
                <Typography variant="small" color="gray">
                  Provide either JSON with required keys (words, count, doc_ids) or comma-separated keywords
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-semibold">
                  Required Fields:
                </Typography>
                <Typography variant="small" color="gray">
                  words: Array of keywords/topics, count: Number of items, doc_ids: Array of document IDs
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-semibold">
                  Example Usage:
                </Typography>
                <Typography variant="small" color="gray">
                  Enter topics like "electricity billing, power outage, meter reading" or provide structured JSON
                </Typography>
              </div>
            </div>
          </div>
                </TabPanel>
                <TabPanel value="history">
                  {renderHistoricalCategories()}
                </TabPanel>
              </TabsBody>
            </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

export default AICategories;
