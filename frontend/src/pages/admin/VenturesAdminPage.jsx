import React from 'react';
import { APP_CONFIG } from '../../config/app';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Edit2, ExternalLink } from 'lucide-react';

const VenturesAdminPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0A1628]">Manage Ventures</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <p className="text-gray-600 mb-8">Ventures are currently managed via the <code className="bg-gray-100 px-2 py-1 rounded text-[#C9A84C]">src/config/app.js</code> configuration file. In the future, this will be moved to the database for dynamic updates.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APP_CONFIG.ventures.map((venture) => (
            <div key={venture.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all relative overflow-hidden group">
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{ backgroundColor: venture.color }}
              ></div>
              <div className="mt-2 flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-[#0A1628]">{venture.name}</h3>
                <Badge variant={venture.status === 'live' ? 'success' : 'warning'}>{venture.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{venture.description}</p>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <Badge variant={venture.isRevealed ? 'primary' : 'secondary'}>
                  {venture.isRevealed ? 'Public' : 'Hidden'}
                </Badge>
                <div className="flex gap-2">
                  {venture.websiteUrl && (
                    <a href={venture.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#C9A84C] bg-gray-50 hover:bg-yellow-50 rounded-lg transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button className="p-2 text-gray-400 hover:text-[#0A1628] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Edit config">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenturesAdminPage;
