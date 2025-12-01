import React, { useState } from 'react';
import { Link, Edit, X, Plus, Trash2 } from 'lucide-react';

interface QuickLink {
  id: string;
  name: string;
  url: string;
}

interface QuickLinksProps {
  isAdminMode: boolean;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ isAdminMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<QuickLink[]>([
    { id: '1', name: 'Google Sheets', url: 'https://docs.google.com/spreadsheets/d/1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA/edit' },
    { id: '2', name: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
    { id: '3', name: 'Gmail', url: 'https://mail.google.com' },
    { id: '4', name: 'Google Drive', url: 'https://drive.google.com' }
  ]);
  const [editMode, setEditMode] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '' });

  const saveLinks = (updatedLinks: QuickLink[]) => {
    setLinks(updatedLinks);
    // Note: Links are dynamically managed in component state
    console.log('Updated links:', updatedLinks);
  };

  const addLink = () => {
    if (newLink.name && newLink.url) {
      const link = { id: Date.now().toString(), ...newLink };
      saveLinks([...links, link]);
      setNewLink({ name: '', url: '' });
    }
  };

  const deleteLink = (id: string) => {
    saveLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
        title="Quick Links"
      >
        <Link size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Quick Links</h3>
            <div className="flex items-center gap-2">
              {isAdminMode && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-4">
            {links.map((link, index) => (
              <div key={link.id}>
                <div className="flex items-center gap-2 py-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-slate-700 hover:text-indigo-600 transition-colors truncate"
                  >
                    {link.name}
                  </a>
                  {editMode && isAdminMode && (
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {index < links.length - 1 && <div className="border-b border-slate-200"></div>}
              </div>
            ))}

            {editMode && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <input
                  type="text"
                  placeholder="Link name"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                />
                <button
                  onClick={addLink}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};