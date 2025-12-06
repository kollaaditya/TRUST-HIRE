import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Filter, X } from "lucide-react";
import { LocationDetector } from "./LocationDetector";

interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
}

interface EnhancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const categories = [
  "All Categories",
  "Information Technology",
  "Healthcare",
  "Education & Training",
  "Sales & Marketing",
  "Finance & Accounting",
  "Engineering",
  "Construction",
  "Hospitality & Food Service",
  "Retail",
  "Transportation & Logistics",
  "Other"
];



const jobTypes = [
  "All Types",
  "full-time",
  "part-time"
];

export const EnhancedFilters = ({ filters, onFiltersChange, onClearFilters }: EnhancedFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== "All Categories" && value !== "All Types"
  );

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value && value !== "All Categories" && value !== "All Types"
    ).length;
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Location Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title or description..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="pl-10"
                />
              </div>
              <LocationDetector onLocationDetected={(location) => updateFilter('location', location)} />
            </div>
          </div>

          {/* Category Row */}
          <div className="grid md:grid-cols-1 gap-4">
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Type and Salary Row */}
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={filters.jobType} onValueChange={(value) => updateFilter('jobType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "All Types" ? type : type.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min salary"
              value={filters.salaryMin}
              onChange={(e) => updateFilter('salaryMin', e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max salary"
              value={filters.salaryMax}
              onChange={(e) => updateFilter('salaryMax', e.target.value)}
            />
          </div>

          {/* Active Filters and Clear Button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
