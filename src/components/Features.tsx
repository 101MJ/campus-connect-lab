
import React from 'react';
import { CheckSquare, Users, MessageSquare, BookOpen, User, Calendar } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col items-center md:items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-collabCorner-blue-light text-collabCorner-purple mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center md:text-left">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: "Project Management",
      description: "Create projects, track progress with checklists, and meet deadlines with our intuitive tools."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Invite classmates to join your projects and work together efficiently in real-time."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Community Spaces",
      description: "Connect with peers through discussion boards and interest-based groups."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Showcase Work",
      description: "Publish projects and receive feedback from the community to improve your work."
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "Profile Building",
      description: "Highlight your skills, grades, and portfolio to boost academic and career prospects."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Never miss a deadline with our integrated calendar and reminder system."
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Excel</h2>
          <p className="max-w-[800px] text-lg md:text-xl text-muted-foreground">
            Our platform combines powerful tools to help you manage work, collaborate with peers, and
            build your academic community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-slow">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
