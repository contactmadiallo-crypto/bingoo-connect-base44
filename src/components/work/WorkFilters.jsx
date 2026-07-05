import React from 'react';
import { MobileSelect } from "@/components/ui/mobile-select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function WorkFilters({ filters, onFilterChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search work items..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
        />
      </div>
      
      <MobileSelect
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        options={[
          { value: "all", label: "All Status" },
          { value: "pending", label: "Pending" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
        ]}
        placeholder="Status"
        ariaLabel="Filter by status"
        className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200"
      />

      <MobileSelect
        value={filters.priority}
        onValueChange={(value) => onFilterChange({ ...filters, priority: value })}
        options={[
          { value: "all", label: "All Priority" },
          { value: "urgent", label: "Urgent" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
        placeholder="Priority"
        ariaLabel="Filter by priority"
        className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200"
      />

      <MobileSelect
        value={filters.category}
        onValueChange={(value) => onFilterChange({ ...filters, category: value })}
        options={[
          { value: "all", label: "All Categories" },
          { value: "development", label: "Development" },
          { value: "design", label: "Design" },
          { value: "meeting", label: "Meeting" },
          { value: "documentation", label: "Documentation" },
          { value: "bug_fix", label: "Bug Fix" },
          { value: "testing", label: "Testing" },
          { value: "review", label: "Review" },
          { value: "research", label: "Research" },
          { value: "other", label: "Other" },
        ]}
        placeholder="Category"
        ariaLabel="Filter by category"
        className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200"
      />
    </div>
  );
}