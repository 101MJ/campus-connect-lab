
import React, { useState, useEffect } from 'react';
import { Tag, X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface PostTagsFilterProps {
  onFilterChange: (tags: string[]) => void;
}

const PREDEFINED_TAGS = [
  'Question', 'Discussion', 'Announcement', 'Resource', 'Event', 'Help', 'Project', 'Other'
];

const PostTagsFilter: React.FC<PostTagsFilterProps> = ({ onFilterChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load tags from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('community-post-tags');
    if (savedTags) {
      try {
        setSelectedTags(JSON.parse(savedTags));
      } catch (e) {
        console.error("Failed to parse saved tags", e);
      }
    }
  }, []);

  // Save tags to localStorage when they change
  useEffect(() => {
    localStorage.setItem('community-post-tags', JSON.stringify(selectedTags));
    onFilterChange(selectedTags);
  }, [selectedTags, onFilterChange]);

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setCustomTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const filteredTags = PREDEFINED_TAGS.filter(
    tag => tag.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedTags.includes(tag)
  );

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="h-4 w-4 text-collabCorner-purple" />
        <span className="text-sm font-medium">Filter by tags:</span>
        
        {selectedTags.map(tag => (
          <Badge 
            key={tag} 
            variant="outline"
            className="bg-collabCorner-purple/10 text-collabCorner-purple flex items-center gap-1 animate-fade-in"
          >
            {tag}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 rounded-full p-0 text-collabCorner-purple hover:bg-collabCorner-purple/20"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag} tag</span>
            </Button>
          </Badge>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3" align="start">
            <div className="space-y-2">
              <div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm pl-8"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 py-1">
                {filteredTags.length > 0 ? (
                  filteredTags.map(tag => (
                    <Button 
                      key={tag}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-7 text-sm px-2"
                      onClick={() => handleAddTag(tag)}
                    >
                      <Tag className="h-3 w-3 mr-2" />
                      {tag}
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2">No matching tags found</p>
                )}
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <Input
                  placeholder="Custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="h-8 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customTag.trim()) {
                      handleAddTag(customTag.trim());
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  variant="default"
                  className="h-8"
                  onClick={() => customTag.trim() && handleAddTag(customTag.trim())}
                >
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedTags([])}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostTagsFilter;
