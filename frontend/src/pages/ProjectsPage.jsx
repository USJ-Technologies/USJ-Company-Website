import { useState, useEffect } from 'react';
import { Briefcase, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { getProjects } from '../lib/queries';

const filterTabs = ['All', 'Govt', 'Defence', 'Tech', 'GeM'];

const staticProjects = [
  {
    _id: 'p1',
    name: 'CCTV Surveillance System — Uttarakhand Police',
    clientType: 'govt',
    client: 'Uttarakhand Police Department',
    description: 'Supply and installation of 48 HD CCTV cameras with NVR and centralized monitoring at multiple police stations across Dehradun district.',
    tags: ['Surveillance', 'Security', 'GeM', 'Govt'],
    color: '#EBF4FF',
    image: '/Generated/projects-page/installation-cctv.png',
    value: '₹12.5 Lakhs',
    year: '2024',
  },
  {
    _id: 'p2',
    name: 'IT Networking Infrastructure — DRDO Facility',
    clientType: 'defence',
    client: 'Defence Research & Development Organisation',
    description: 'Complete structured cabling, networking, and Wi-Fi setup for a secure research facility. Included firewall configuration and network security compliance.',
    tags: ['Networking', 'Defence', 'Infrastructure', 'Security'],
    color: '#FFF3CD',
    image: '/Generated/projects-page/network-nifra.png',
    value: '₹18.2 Lakhs',
    year: '2024',
  },
  {
    _id: 'p3',
    name: 'GeM Procurement — Office IT Equipment',
    clientType: 'gem',
    client: 'District Collectorate, Dehradun',
    description: 'Procurement of 50 desktop computers, 20 printers, and accessories for government offices via GeM marketplace.',
    tags: ['GeM', 'IT Equipment', 'Govt'],
    color: '#D4EDDA',
    image: '/Generated/projects-page/delivery-dispatch.png',
    value: '₹8.7 Lakhs',
    year: '2024',
  },
  {
    _id: 'p4',
    name: 'UPS Power Backup — Government Hospital',
    clientType: 'govt',
    client: 'Doon Medical College & Hospital',
    description: 'Supply and installation of 15 UPS units (1-5 KVA) for critical IT infrastructure and medical equipment backup power.',
    tags: ['Power Solutions', 'Healthcare', 'Govt'],
    color: '#EBF4FF',
    image: '/Generated/projects-page/network-nifra.png',
    value: '₹6.3 Lakhs',
    year: '2024',
  },
  {
    _id: 'p5',
    name: 'Communication Devices — Border Police',
    clientType: 'defence',
    client: 'Indo-Tibetan Border Police',
    description: 'Supply of ruggedized communication handsets and accessories for remote border patrol operations.',
    tags: ['Communication', 'Defence', 'ITBP'],
    color: '#FFF3CD',
    image: '/Generated/projects-page/installation-cctv.png',
    value: '₹22.1 Lakhs',
    year: '2025',
  },
  {
    _id: 'p6',
    name: 'Technology Audit & Procurement Advisory',
    clientType: 'tech',
    client: 'Uttarakhand Skill Development Mission',
    description: 'Technology needs assessment and procurement advisory for skill development centers across 5 districts.',
    tags: ['Advisory', 'Tech', 'Education'],
    color: '#E8D5F5',
    image: '/Generated/projects-page/delivery-dispatch.png',
    value: '₹3.5 Lakhs',
    year: '2025',
  },
];

const badgeTypeMap = { govt: 'govt', defence: 'defence', gem: 'gem', tech: 'tech' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getProjects().then(({ data }) => {
      setProjects(data?.length ? data : staticProjects);
      setIsLoading(false);
    });
  }, []);

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => {
        const type = p.clientType ?? p.category ?? '';
        return type.toLowerCase() === activeFilter.toLowerCase();
      });

  return (
    <div>
      {/* Hero */}
      <section className="section-py hero-pattern">
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Portfolio</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-5">Our Projects</h1>
          <p className="text-lg text-[#4A5568] max-w-xl leading-relaxed">
            A track record of successful delivery for government, defence, and commercial clients across India.
          </p>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="section-py bg-white">
        <div className="container-max">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0"
                style={{
                  backgroundColor: activeFilter === tab ? '#0A1628' : '#F8F9FA',
                  color: activeFilter === tab ? '#fff' : '#4A5568',
                  border: `1px solid ${activeFilter === tab ? '#0A1628' : '#E2E8F0'}`,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-[#718096]">No projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <Card key={project._id} className="overflow-hidden" hover>
                  {project.image ? (
                    <img src={project.image} alt={project.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="h-2" style={{ backgroundColor: project.color || '#EBF4FF' }} />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge type={badgeTypeMap[(project.clientType ?? project.category ?? 'govt').toLowerCase()] || 'govt'}>
                        {(project.clientType ?? project.category ?? 'GOVT').toUpperCase()}
                      </Badge>
                      {project.year && (
                        <span className="text-xs text-[#718096]">{project.year}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#0A1628] mb-1 text-sm line-clamp-2">{project.name}</h3>
                    <p className="text-xs text-[#C9A84C] font-medium mb-2">{project.client}</p>
                    <p className="text-sm text-[#4A5568] leading-relaxed mb-3 line-clamp-3">{project.description}</p>
                    {project.value && (
                      <p className="text-xs font-semibold text-[#0A1628] mb-3">Value: {project.value}</p>
                    )}
                    {project.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-[#F8F9FA] text-[#718096] border border-[#E2E8F0]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setSelected(project)}
                      className="text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge type={badgeTypeMap[(selected.clientType ?? selected.category ?? 'govt').toLowerCase()] || 'govt'}>
                {(selected.clientType ?? selected.category ?? 'GOVT').toUpperCase()}
              </Badge>
              {selected.year && <span className="text-xs text-[#718096] self-center">{selected.year}</span>}
            </div>
            <p className="text-sm font-medium text-[#C9A84C] mb-3">{selected.client}</p>
            <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{selected.description}</p>
            {selected.value && (
              <div className="p-3 rounded-lg bg-[#F8F9FA] mb-4">
                <p className="text-xs text-[#718096]">Project Value</p>
                <p className="font-bold text-[#0A1628]">{selected.value}</p>
              </div>
            )}
            {selected.tags && (
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded text-xs bg-[#EBF4FF] text-[#1A3A5C] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
