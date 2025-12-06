import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Users } from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: t('about.mission'),
      content: t('about.missionText')
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: t('about.vision'),
      content: t('about.visionText')
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('about.team'),
      content: t('about.teamText')
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h1>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {section.icon}
                </div>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
