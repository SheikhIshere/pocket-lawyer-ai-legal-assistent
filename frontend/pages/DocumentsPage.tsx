import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header, Footer } from '../components/Layout';
import { 
  FileText, Download, Search, Filter, Plus, 
  Calendar, User, Eye, Trash2, Share2,
  File, Folder, Clock, CheckCircle,
  AlertCircle, FilePlus, Grid, List,
  ChevronDown, X, Upload, MoreVertical,
  BarChart, Lock, Unlock, Tag
} from 'lucide-react';

// Mock data - replace with API call later
const mockDocuments = [
  {
    id: 1,
    title: 'Employment Law Consultation',
    type: 'chat',
    status: 'completed',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-18T14:20:00Z',
    size: '2.4 MB',
    pages: 12,
    category: 'Employment',
    description: 'Legal consultation regarding employment contract terms',
    tags: ['Employment', 'Contract', 'Legal'],
    isShared: false,
    accessLevel: 'private',
    lastAccessed: '2026-01-19T09:15:00Z'
  },
  {
    id: 2,
    title: 'NDA Discussion',
    type: 'chat',
    status: 'completed',
    created_at: '2026-01-12T09:15:00Z',
    updated_at: '2026-01-16T11:45:00Z',
    size: '1.2 MB',
    pages: 8,
    category: 'Business',
    description: 'Confidentiality agreement discussion and advice',
    tags: ['Business', 'NDA', 'Confidential'],
    isShared: true,
    accessLevel: 'shared',
    lastAccessed: '2026-01-17T14:30:00Z'
  }
];

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = [
    { value: 'all', label: 'All Sessions', count: mockDocuments.length },
    { value: 'chat', label: 'Chat Sessions', count: mockDocuments.length },
    { value: 'employment', label: 'Employment', count: 1 },
    { value: 'business', label: 'Business', count: 1 }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'draft', label: 'Draft', color: 'yellow' },
    { value: 'review', label: 'In Review', color: 'blue' },
    { value: 'archived', label: 'Archived', color: 'gray' }
  ];


  const accessLevelColors = {
    private: 'text-red-600 bg-red-50 border-red-200',
    shared: 'text-blue-600 bg-blue-50 border-blue-200',
    public: 'text-green-600 bg-green-50 border-green-200'
  };

  const typeIcons = {
    chat: <FileText className="w-5 h-5 text-teal-600" />,
    employment: <FileText className="w-5 h-5 text-purple-600" />,
    business: <FileText className="w-5 h-5 text-blue-600" />
  };

  const typeColors = {
    chat: 'bg-teal-100',
    employment: 'bg-purple-100',
    business: 'bg-blue-100'
  };

  // Filter and sort documents
  useEffect(() => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort documents
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'size':
          aValue = parseFloat(a.size);
          bValue = parseFloat(b.size);
          break;
        case 'date':
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const handleExportPDF = async (documentId: number) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log(`Exporting document ${documentId} to PDF...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Replace with actual PDF URL
      link.download = `document-${documentId}.pdf`;
      link.click();
      
      // Show success notification
      console.log('Document exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMultiplePDF = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log(`Exporting ${selectedDocuments.length} documents to PDF...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`${selectedDocuments.length} documents exported successfully!`);
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const totalFileSize = useMemo(() => {
    return filteredDocuments.reduce((total, doc) => {
      return total + parseFloat(doc.size);
    }, 0).toFixed(1) + ' MB';
  }, [filteredDocuments]);

  if (documents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Header />
        <main className="pb-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Sessions</h1>
            <p className="text-gray-600">Export your legal consultation chat sessions to PDF</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FileText className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Chat Sessions</h2>
            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
              You haven't had any legal consultation chat sessions yet. Start a chat session to generate your first PDF export.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <FilePlus className="w-5 h-5" />
                <span className="text-lg">Start Chat Session</span>
              </button>
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 font-medium">
                <Upload className="w-5 h-5" />
                <span className="text-lg">Import Chat History</span>
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Supported formats: PDF, DOC, DOCX, TXT • Max file size: 10MB
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />
      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Sessions</h1>
              <p className="text-gray-600">Export your legal consultation chat sessions to PDF</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {selectedDocuments.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportMultiplePDF}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export {selectedDocuments.length} PDF{selectedDocuments.length > 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => setSelectedDocuments([])}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              )}            
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{totalFileSize}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents by title, description, tags, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Add more filter options here */}
              </div>
            </div>
          )}

          {/* Selected Documents Info */}
          {selectedDocuments.length > 0 && (
            <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="text-teal-700 font-medium">
                    {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={selectAllDocuments}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {selectedDocuments.length === filteredDocuments.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents Grid/List */}
        <div className="mb-10">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Documents Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                No documents match your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredDocuments.map(document => (
                <div
                  key={document.id}
                  className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-teal-300 flex flex-col h-full ${
                    selectedDocuments.includes(document.id) ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => toggleDocumentSelection(document.id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 h-14 overflow-hidden">{document.title}</h3>
                          <p className="text-sm text-gray-600">{formatDate(document.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleExportPDF(document.id)}
                      disabled={isLoading}
                      className="p-2 text-gray-600 hover:text-teal-600 transition-colors disabled:opacity-50"
                      title="Export to PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{document.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {document.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {document.pages} pages
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatFileSize(document.size)}
                    </span>
                  </div>

                  {/* Actions - Always at bottom */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleExportPDF(document.id)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination - Add when API is ready */}
        {filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg bg-teal-50 text-teal-600 border-teal-200">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent animate-spin rounded-full mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Exporting Documents</h3>
                <p className="text-gray-600 text-center mb-6">
                  Please wait while we prepare your documents for download...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentsPage;