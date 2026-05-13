import React from 'react';
import { ArrowLeft, FileUp, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadDocumentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Upload Document</h1>
            <p className="text-slate-500 text-sm">Add a new procedure, drawing, certificate, or template.</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Document Name</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Safety Procedure v2.1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Type</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Select type</option>
              <option>Procedure</option>
              <option>Drawing</option>
              <option>Certificate</option>
              <option>Template</option>
              <option>Client Attachment</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Version</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., 2.1 / A12 / 2026" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Visibility</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>All branches</option>
              <option>Riyadh only</option>
              <option>Jeddah only</option>
              <option>Dammam only</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">File</label>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
              <FileUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-900">Drop file here or browse</div>
            <div className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOCX up to 50MB</div>
            <button type="button" className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Browse Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentPage;
