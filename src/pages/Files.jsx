import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Image, File, Upload, Search, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Files() {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: workItems } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list('-created_date'),
    initialData: [],
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date'),
    initialData: [],
  });

  // Collect all files from work items and expenses
  const allFiles = [
    ...workItems.flatMap(work => 
      (work.attachments || []).map(att => ({
        ...att,
        source: 'work',
        sourceTitle: work.title,
        sourceId: work.id
      }))
    ),
    ...expenses.filter(exp => exp.receipt_url).map(exp => ({
      name: `${exp.description} - Receipt`,
      url: exp.receipt_url,
      uploaded_at: exp.created_date,
      source: 'expense',
      sourceTitle: exp.description,
      sourceId: exp.id
    }))
  ];

  const filteredFiles = allFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.sourceTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (['pdf'].includes(ext)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const handleFileUpload = async (event, workId) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    // Here you would update the work item with the new attachment
    // This is simplified - you'd need to get the current work item and update it
    
    setUploading(false);
  };

  const stats = {
    total: allFiles.length,
    fromWork: workItems.flatMap(w => w.attachments || []).length,
    fromExpenses: expenses.filter(e => e.receipt_url).length
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              File Library
            </h1>
            <p className="text-slate-600">All attachments and documents in one place</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Work Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.fromWork}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Expense Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.fromExpenses}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>All Files ({filteredFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {allFiles.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-sm text-slate-500 truncate">{file.sourceTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        {file.source === 'work' ? 'Work' : 'Expense'}
                      </Badge>
                      {file.uploaded_at && (
                        <span className="text-xs text-slate-500">
                          {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open File
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}