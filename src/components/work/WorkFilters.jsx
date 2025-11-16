import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      
      <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
        <SelectTrigger className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority} onValueChange={(value) => onFilterChange({ ...filters, priority: value })}>
        <SelectTrigger className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
        <SelectTrigger className="w-full md:w-40 bg-white/80 backdrop-blur-sm border-slate-200">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="documentation">Documentation</SelectItem>
          <SelectItem value="bug_fix">Bug Fix</SelectItem>
          <SelectItem value="testing">Testing</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="research">Research</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}