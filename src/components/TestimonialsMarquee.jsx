import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function TestimonialsMarquee() {
  const sectionRef = useRef(null)

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "City Rentals",
      quote: "Ev Rental transformed our fleet management completely.",
      initials: "SJ"
    },
    {
      name: "Michael Chen",
      company: "Metro Car Services",
      quote: "The AI insights are game-changing for our business.",
      initials: "MC"
    },
    {
      name: "Emily Rodriguez",
      company: "Premium Auto Rentals",
      quote: "Customer satisfaction has never been higher.",
      initials: "ER"
    },
    {
      name: "David Kim",
      company: "Urban Fleet Solutions",
      quote: "Automated billing saves us hours every week.",
      initials: "DK"
    },
    {
      name: "Lisa Wang",
      company: "Express Rentals",
      quote: "The mobile app integration is seamless.",
      initials: "LW"
    }
  ]

  useEffect(() => {
    if (!sectionRef.current) return

    // Simple test - animate the section itself first
    gsap.fromTo(sectionRef.current, 
      { 
        opacity: 0,
        y: 100 
      },
      { 
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    )

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="py-16 bg-muted/20 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Trusted by Industry Leaders</h2>
        <p className="text-muted-foreground">See what our customers are saying about Ev Rental</p>
      </div>
      
      {/* Top Row - Moving Left */}
      <div className="flex animate-marquee-left">
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div key={`top-${index}`} className="flex-shrink-0 mx-2">
            <Card className="w-80 h-40 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Bottom Row - Moving Right */}
      <div className="flex animate-marquee-right mt-4">
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div key={`bottom-${index}`} className="flex-shrink-0 mx-2">
            <Card className="w-80 h-40 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}
