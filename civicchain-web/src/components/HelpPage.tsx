import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { HelpCircle, BookOpen, Video, Mail, Phone, MessageCircle, FileQuestion, CheckCircle2, Clock, Shield, Zap, Search } from "lucide-react";
import { useState } from "react";

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How do I verify a complaint?",
      answer: "Navigate to Departments, select a category, and click the 'Verify' button on pending complaints after reviewing the details and photo evidence.",
      category: "Verification",
    },
    {
      question: "What happens when I mark a complaint as resolved?",
      answer: "You'll be prompted to upload a resolution photo. This photo serves as proof that the issue has been addressed and will be stored in the complaint history.",
      category: "Resolution",
    },
    {
      question: "How are AI insights generated?",
      answer: "The AI analyzes historical complaint patterns, seasonal trends, and department performance to provide predictive insights and recommendations.",
      category: "Analytics",
    },
    {
      question: "Can I export reports?",
      answer: "Yes! Visit the Reports page to download daily, weekly, or monthly reports in PDF or Excel format. You can also export category-specific reports.",
      category: "Reports",
    },
    {
      question: "What do the performance scores mean?",
      answer: "Performance scores (0-100) are calculated based on resolution rate, average resolution time, and complaint volume. 90+ is Excellent, 80-89 is Good, 70-79 is Fair.",
      category: "Performance",
    },
    {
      question: "How can I upload multiple resolution images?",
      answer: "When marking a complaint as resolved, you can select multiple images from your device. All images will be displayed in the complaint's resolution gallery.",
      category: "Resolution",
    },
    {
      question: "What is the complaint heatmap?",
      answer: "The heatmap on the Performance page shows the geographic distribution of complaints across your municipal area, helping identify hotspots.",
      category: "Analytics",
    },
    {
      question: "How do I filter complaints by status?",
      answer: "Use the status tabs at the top of each department page to switch between Pending, Verified, and Resolved complaints.",
      category: "Navigation",
    },
  ];

  const resources = [
    {
      title: "User Guide",
      description: "Complete guide to using the municipal dashboard",
      icon: BookOpen,
      color: "blue",
      badge: "PDF",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      icon: Video,
      color: "purple",
      badge: "15 Videos",
    },
    {
      title: "Email Support",
      description: "support@municipal.gov.in",
      icon: Mail,
      color: "green",
      badge: "24h Response",
    },
    {
      title: "Helpline",
      description: "1800-XXX-XXXX (24/7)",
      icon: Phone,
      color: "amber",
      badge: "Toll Free",
    },
  ];

  const quickLinks = [
    {
      title: "Getting Started",
      description: "Learn the basics of complaint management",
      icon: Zap,
      color: "bg-blue-500",
    },
    {
      title: "Best Practices",
      description: "Tips for efficient complaint resolution",
      icon: CheckCircle2,
      color: "bg-green-500",
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: FileQuestion,
      color: "bg-amber-500",
    },
    {
      title: "Security & Privacy",
      description: "Data protection and security guidelines",
      icon: Shield,
      color: "bg-purple-500",
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    searchQuery === "" || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1>Help & Support</h1>
            <p className="text-gray-600">Get answers to common questions and access support resources</p>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-blue-600" />
          <h2>Quick Start Guide</h2>
          <Badge className="ml-2 bg-blue-600 text-white">New</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-xl">1</span>
            </div>
            <h3 className="mb-2">Review Complaints</h3>
            <p className="text-sm text-gray-600">Browse complaints by department category and view detailed information including photos and location</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-xl">2</span>
            </div>
            <h3 className="mb-2">Verify & Track</h3>
            <p className="text-sm text-gray-600">Verify authentic complaints and track their progress through the resolution pipeline</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-pink-100">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-500 text-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <span className="text-xl">3</span>
            </div>
            <h3 className="mb-2">Resolve with Proof</h3>
            <p className="text-sm text-gray-600">Mark complaints as resolved and upload photo verification to maintain transparency</p>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Card key={index} className="p-5 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300">
              <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm mb-1 group-hover:text-blue-600 transition-colors">{link.title}</h3>
              <p className="text-xs text-gray-600">{link.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-8 shadow-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs by question, answer, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* FAQs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h2>Frequently Asked Questions</h2>
          <Badge variant="outline" className="ml-2">{filteredFaqs.length} Questions</Badge>
        </div>
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="flex items-center gap-2 flex-1">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  {faq.question}
                </h3>
                <Badge variant="outline" className="flex-shrink-0">{faq.category}</Badge>
              </div>
              <p className="text-gray-600 pl-7 leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
          
          {filteredFaqs.length === 0 && (
            <Card className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2 text-gray-600">No results found</h3>
              <p className="text-sm text-gray-500">Try searching with different keywords</p>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Phone className="w-6 h-6 text-blue-600" />
          <h2>Contact Support</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const colorClasses = {
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
              green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
            };
            const colors = colorClasses[resource.color as keyof typeof colorClasses];

            return (
              <Card key={index} className={`p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:${colors.ring} hover:ring-4`}>
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="group-hover:text-blue-600 transition-colors">{resource.title}</h3>
                  {resource.badge && (
                    <Badge variant="outline" className="text-xs">{resource.badge}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      

      {/* Still Need Help */}
      <Card className="p-8 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center shadow-xl">
        <h2 className="mb-3 text-white">Still need help?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Our support team is available 24/7 to assist you with any questions or issues
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Start Live Chat
          </button>
          <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2 border border-blue-400">
            <Mail className="w-5 h-5" />
            Email Support
          </button>
        </div>
      </Card>
    </div>
  );
}
