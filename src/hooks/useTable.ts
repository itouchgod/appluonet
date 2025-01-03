import { useState, useCallback, useMemo } from 'react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  defaultPageSize?: number;
}

type TableValue = string | number | boolean | null | undefined;

export function useTable<T extends Record<string, TableValue>>({
  data,
  defaultSort,
  defaultPageSize = 10
}: TableOptions<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    
    if (sortConfig) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    if (searchTerm) {
      sortableData = sortableData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return sortableData;
  }, [data, sortConfig, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = useMemo(() => 
    Math.ceil(sortedData.length / pageSize),
    [sortedData.length, pageSize]
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return undefined;
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRowSelect = useCallback((index: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRows(prev => {
      if (prev.size === paginatedData.length) {
        return new Set();
      }
      return new Set(paginatedData.map((_, index) => index));
    });
  }, [paginatedData]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  return {
    data: paginatedData,
    currentPage,
    pageSize,
    totalPages,
    selectedRows,
    sortConfig,
    searchTerm,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleRowSelect,
    handleSelectAll,
    handleSearch
  };
} 