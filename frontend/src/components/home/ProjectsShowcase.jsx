import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { SkeletonCard } from '../ui/Skeleton';
import { ROUTES } from '../../config/app';
import { getProjects } from '../../lib/queries';

const staticProjects = [
  {
    _id: 'p1',
    name: 'CCTV Surveillance System — Uttarakhand Police',
    clientType: 'govt',
    client: 'Uttarakhand Police Department',
    description: 'Supply and installation of HD surveillance cameras and NVR systems across 12 locations.',
    tags: ['Surveillance', 'Security', 'GeM'],
    color: '#EBF4FF',
    image: '/Generated/projects-page/installation-cctv.png',
  },
  {
    _id: 'p2',
    name: 'Networking Infrastructure — DRDO Facility',
    clientType: 'defence',
    client: 'Defence Research & Development Organisation',
    description: 'End-to-end structured cabling and networking setup for a secure research facility.',
    tags: ['Networking', 'Defence', 'Infrastructure'],
    color: '#FFF3CD',
    image: '/Generated/projects-page/network-nifra.png',
  },
  {
    _id: 'p3',
    name: 'GeM Procurement — Office IT Equipment',
    clientType: 'gem',
    client: 'District Collectorate, Dehradun',
    description: 'Procurement of 50+ computers, printers, and peripherals via GeM marketplace for government offices.',
    tags: ['GeM', 'IT Equipment', 'Govt'],
    color: '#D4EDDA',
    image: '/Generated/projects-page/delivery-dispatch.png',
  },
];

const badgeTypeMap = { govt: 'govt', defence: 'defence', gem: 'gem', tech: 'tech' };

export default function ProjectsShowcase() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjects().then(({ data }) => {
      if (!cancelled) {
        setProjects(data?.length ? data : staticProjects);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const displayProjects = projects.length > 0 ? projects : staticProjects;

  return (
    <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container-max">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <SectionHeader
            label="OUR WORK"
            title="Projects That Make a Difference"
            subtitle="Trusted by government departments, defence establishments, and institutions across India."
            className="mb-0"
          />
          <Button as={Link} to={ROUTES.PROJECTS} variant="secondary" size="sm" className="shrink-0 self-start sm:self-auto">
            See All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayProjects.slice(0, 3).map((project) => {
              const clientType = project.clientType ?? project.category?.toLowerCase() ?? 'govt';
              return (
              <Card key={project.id ?? project._id} className="overflow-hidden" hover>
                {project.image ? (
                  <img src={project.image} alt={project.name} loading="lazy" className="w-full h-36 object-cover" />
                ) : (
                  <div className="h-3" style={{ backgroundColor: project.color || '#EBF4FF' }} />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge type={badgeTypeMap[clientType] || 'govt'}>
                      {clientType.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-1 line-clamp-2">{project.name}</h3>
                  <p className="text-xs text-[#C9A84C] font-medium mb-2">{project.client}</p>
                  <p className="text-sm text-[#4A5568] leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                  {project.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-[#F8F9FA] text-[#718096] border border-[#E2E8F0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    to={ROUTES.PROJECTS}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
                  >
                    View Details <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button as={Link} to={ROUTES.PROJECTS} variant="primary" size="lg"
            leftIcon={<Briefcase size={16} />}>
            See All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}
