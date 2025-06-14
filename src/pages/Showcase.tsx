
import React, { useState } from 'react';
import { Search, Filter, Grid, List, TrendingUp, Clock, Heart, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShowcaseProjectGrid from '@/components/showcase/ShowcaseProjectGrid';
import FeaturedProjects from '@/components/showcase/FeaturedProjects';
import { useProjectShowcase } from '@/hooks/useProjectShowcase';

const Showcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { publicProjects, isLoading } = useProjectShowcase();

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'web-dev', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Apps' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'design', label: 'Design' },
    { value: 'game-dev', label: 'Game Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'blockchain', label: 'Blockchain' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: Clock },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'liked', label: 'Most Liked', icon: Heart },
    { value: 'viewed', label: 'Most Viewed', icon: Eye },
  ];

  const filteredProjects = publicProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           project.tags.some(tag => tag.toLowerCase().includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Project Showcase
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing projects from talented creators
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search projects, tags, or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Projects Section */}
        <FeaturedProjects projects={publicProjects.slice(0, 3)} />

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Project Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProjects.length} Projects Found
          </h2>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              size="sm"
            >
              Clear Search
            </Button>
          )}
        </div>

        <ShowcaseProjectGrid
          projects={filteredProjects}
          viewMode={viewMode}
          sortBy={sortBy}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Showcase;
