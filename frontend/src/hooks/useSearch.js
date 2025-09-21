import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';





export const useSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  


  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  


  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim().length >= 1) {
      navigate(`/people?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  


  const handleSearchKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  


  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
    handleSearchKeyPress,
    clearSearch
  };
};