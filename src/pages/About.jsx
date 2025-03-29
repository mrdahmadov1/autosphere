function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-dark py-32">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About AutoSphere</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Your trusted partner in finding the perfect vehicle for your lifestyle and needs.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark mb-6">Our Story</h2>
              <p className="text-lg text-neutral/80 mb-6">
                Founded in 2005, AutoSphere began as a small family-owned dealership with a simple
                mission: to provide high-quality vehicles with exceptional customer service.
              </p>
              <p className="text-lg text-neutral/80 mb-6">
                Over the years, we've grown from our humble beginnings into one of the region's most
                trusted automotive retailers, all while maintaining our core values and commitment
                to customer satisfaction.
              </p>
              <p className="text-lg text-neutral/80">
                Our team of experienced professionals is dedicated to helping you find the perfect
                vehicle that matches your lifestyle, preferences, and budget. We believe in building
                long-term relationships with our customers based on trust, integrity, and excellent
                service.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary rounded-full opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1000&auto=format&fit=crop"
                alt="AutoSphere Dealership"
                className="rounded-xl shadow-card relative z-10 w-full"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-dark mb-16">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-card text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Integrity</h3>
              <p className="text-neutral/70">
                We believe in transparent, honest communication and ethical business practices in
                every interaction.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-card text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Excellence</h3>
              <p className="text-neutral/70">
                We strive for excellence in our service, vehicles, and overall customer experience.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-card text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Customer Focus</h3>
              <p className="text-neutral/70">
                Our customers are at the heart of everything we do, and their satisfaction is our
                highest priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark mb-8">
                Why Choose AutoSphere
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-dark">Wide Selection</h3>
                    <p className="text-neutral/70">
                      We offer a diverse range of vehicles to match every need, preference, and
                      budget.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-dark">Quality Assurance</h3>
                    <p className="text-neutral/70">
                      All our vehicles undergo thorough inspections to ensure they meet our high
                      standards.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-dark">
                      Competitive Pricing
                    </h3>
                    <p className="text-neutral/70">
                      We offer fair, transparent pricing with flexible financing options to fit your
                      budget.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-dark">Expert Support</h3>
                    <p className="text-neutral/70">
                      Our knowledgeable staff is here to assist you throughout your car buying
                      journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <img
                src="https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1000&auto=format&fit=crop"
                alt="Car showroom"
                className="rounded-xl shadow-card h-64 object-cover w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1534093607318-f025413f49cb?q=80&w=1000&auto=format&fit=crop"
                alt="Customer service"
                className="rounded-xl shadow-card h-64 object-cover w-full mt-12"
              />
              <img
                src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1000&auto=format&fit=crop"
                alt="Test drive"
                className="rounded-xl shadow-card h-64 object-cover w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop"
                alt="Car dealership"
                className="rounded-xl shadow-card h-64 object-cover w-full mt-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark mb-6">Meet Our Team</h2>
          <p className="text-lg text-neutral/80 max-w-2xl mx-auto mb-16">
            Our dedicated team of professionals is committed to providing you with the best car
            buying experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-card overflow-hidden group">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-dark">John Davis</h3>
                <p className="text-primary font-medium mb-3">General Manager</p>
                <p className="text-neutral/70 text-sm">
                  With over 15 years of experience in the automotive industry.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-card overflow-hidden group">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-dark">Sarah Johnson</h3>
                <p className="text-primary font-medium mb-3">Sales Director</p>
                <p className="text-neutral/70 text-sm">
                  Dedicated to finding the perfect vehicle match for every customer.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-card overflow-hidden group">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-dark">Michael Chen</h3>
                <p className="text-primary font-medium mb-3">Financial Advisor</p>
                <p className="text-neutral/70 text-sm">
                  Expert in creating tailored financing solutions for our customers.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-card overflow-hidden group">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop"
                  alt="Team member"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-dark">Emily Rodriguez</h3>
                <p className="text-primary font-medium mb-3">Customer Service</p>
                <p className="text-neutral/70 text-sm">
                  Committed to ensuring an exceptional experience for all clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-8 bg-primary text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Visit our showroom today or contact us to schedule a test drive.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/contact" className="btn bg-white text-primary hover:bg-neutral-light">
              Contact Us
            </a>
            <a
              href="/"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary"
            >
              Browse Inventory
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
