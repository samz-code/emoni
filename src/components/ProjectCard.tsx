import type { Project } from "@/data/projects";

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className="bg-snow border border-border border-t-4 border-t-ember rounded-[4px] p-8 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-block bg-forest text-cream text-xs rounded-[4px] px-2 py-1 font-body">
          {project.sector}
        </span>
        {project.year && (
          <span className="font-body text-[11px] text-[#9A9A9A]">{project.year}</span>
        )}
      </div>
      <h3 className="font-display text-2xl text-ink mt-4">{project.name}</h3>
      <p className="font-body text-base text-[#4A4A4A] mt-3 flex-grow">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {project.tags.map((tag) => (
          <span key={tag} className="border border-olive text-olive text-xs rounded-[4px] px-2 py-0.5 font-body">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5">
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember font-body text-[14px] font-medium hover:underline"
          >
            Visit Website →
          </a>
        ) : (
          <span className="text-[#9A9A9A] font-body text-sm">Details on Request</span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
