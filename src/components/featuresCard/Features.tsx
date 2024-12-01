import { 
  BarChart2, 
  Book, 
  FileText, 
  Lock, 
  Sparkles 
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";


export default function Features() {

  const features = [
    {
      icon: Book,
      title: "Rich Text Editor",
      description:
        "Express yourself with a powerful editor supporting markdown, formatting, and more.",
    },
    {
      icon: Sparkles,
      title: "Daily Inspiration",
      description:
        "Get inspired with daily prompts and mood-based imagery to spark your creativity.",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description:
        "Your thoughts are safe with enterprise-grade security and privacy features.",
    },
  ];

  return (
    <>
      <section id="features" className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {
          features.map((feature, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="p-6 bg-white rounded-xl border-orange-300">
                <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="size-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-xl text-orange-900 mb-2">{feature.title}</h3>
                <p className="text-orange-700">{feature.description}</p>
              </CardContent>
            </Card>
          ))
        }
      </section>

      <div className="space-y-24 mt-24">
        {/* First Section - Text Left, Skeleton Right */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="size-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900">Rich Text Editor</h3>
            <p className="text-lg text-orange-700">Express yourself fully with our powerful editor featuring:</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-400" />
                <span>Format text with ease</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-400" />
                <span>Embed links</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4 bg-white rounded-2xl shadow-xl p-6 border border-orange-300">
            <div className="flex gap-2 mb-6">
              <div className="size-8 rounded bg-orange-100" />
              <div className="size-8 rounded bg-orange-100" />
              <div className="size-8 rounded bg-orange-100" />
            </div>
            <Skeleton className="h-4 bg-orange-200 rounded-full w-3/4" />
            <Skeleton className="h-4 bg-orange-300 rounded-full w-full" />
            <Skeleton className="h-4 bg-orange-400 rounded-full w-2/3" />
            <Skeleton className="h-4 bg-orange-200 rounded-full w-1/3" />
          </div>
        </div>

        {/* Second Section - Skeleton Left, Text Right */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6 md:order-last">
            <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart2 className="size-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900">Mood Analytics</h3>
            <p className="text-lg text-orange-700">Track your emotional journey with powerful analytics:</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-400" />
                <span>Visual mood trends</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-400" />
                <span>Pattern recognition</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4 bg-white rounded-2xl shadow-xl p-6 border border-orange-300 md:order-first">
            <div className="h-40 bg-gradient-to-t from-orange-100 to-orange-50 rounded-lg" />
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-orange-200 rounded" />
              <div className="h-4 w-16 bg-orange-300 rounded" />
              <div className="h-4 w-16 bg-orange-400 rounded" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}