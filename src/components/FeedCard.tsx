interface FeedCardProps {
  image: string;
  category: string;
  title: string;
  summary: string;
  date: string;
}

const FeedCard = ({ image, category, title, summary, date }: FeedCardProps) => {
  return (
    <article className="group relative bg-card rounded-sm overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500 electric-hover">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-primary text-primary-foreground font-display text-xs tracking-widest">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 lg:p-6">
        <h3 className="font-display text-lg lg:text-xl text-foreground mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="font-body text-sm lg:text-base text-muted-foreground mb-4 line-clamp-2">
          {summary}
        </p>
        
        {/* Date stamp */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <span className="digital-code">{date}</span>
        </div>
      </div>

      {/* Hover border glow effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 border border-primary/30 rounded-sm" />
      </div>
    </article>
  );
};

export default FeedCard;
