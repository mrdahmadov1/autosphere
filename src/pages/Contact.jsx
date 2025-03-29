import { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'general',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, you would send the form data to a server here
      console.log('Form submitted:', formData);

      // Show success message
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          interest: 'general',
        });
        setIsSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-dark py-24">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Have questions or need assistance? We're here to help!
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-dark mb-8">Send Us a Message</h2>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-xl mb-8">
                  <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                  <p>Your message has been sent successfully. We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-neutral-dark font-medium mb-2">
                      Your Name <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input ${
                        errors.name ? 'border-secondary' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-secondary text-sm">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-neutral-dark font-medium mb-2">
                      Email Address <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${
                        errors.email ? 'border-secondary' : 'border-gray-300'
                      }`}
                      placeholder="johndoe@example.com"
                    />
                    {errors.email && <p className="mt-1 text-secondary text-sm">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-neutral-dark font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="(123) 456-7890"
                    />
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-neutral-dark font-medium mb-2">
                      What are you interested in?
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales</option>
                      <option value="service">Service Department</option>
                      <option value="financing">Financing Options</option>
                      <option value="testdrive">Schedule Test Drive</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-neutral-dark font-medium mb-2">
                      Your Message <span className="text-secondary">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={`form-input ${
                        errors.message ? 'border-secondary' : 'border-gray-300'
                      }`}
                      placeholder="How can we help you?"
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-secondary text-sm">{errors.message}</p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-dark mb-8">Contact Information</h2>

              <div className="bg-neutral-light rounded-xl p-8 mb-8">
                <div className="flex items-start mb-6">
                  <div className="bg-white p-3 rounded-full mr-4">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-dark mb-1">Our Location</h3>
                    <p className="text-neutral/70">
                      123 Main Street
                      <br />
                      Anytown, ST 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-6">
                  <div className="bg-white p-3 rounded-full mr-4">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-dark mb-1">Phone Number</h3>
                    <p className="text-neutral/70">
                      Sales: (123) 456-7890
                      <br />
                      Service: (123) 456-7891
                      <br />
                      Support: (123) 456-7892
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-6">
                  <div className="bg-white p-3 rounded-full mr-4">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-dark mb-1">Email Address</h3>
                    <p className="text-neutral/70">
                      info@autosphere.com
                      <br />
                      sales@autosphere.com
                      <br />
                      support@autosphere.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full mr-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-dark mb-1">Business Hours</h3>
                    <p className="text-neutral/70">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden shadow-card h-80 bg-neutral-light flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-primary mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <p className="text-neutral-dark font-medium">
                    Interactive Map Would Be Displayed Here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-dark mb-16">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-card p-8">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                What types of financing options do you offer?
              </h3>
              <p className="text-neutral/70">
                We offer a variety of financing options including standard loans, leasing, and
                special financing for customers with all credit backgrounds. Our finance department
                will work with you to find the best option for your budget.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-8">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">Do you accept trade-ins?</h3>
              <p className="text-neutral/70">
                Yes, we accept trade-ins of all makes and models. Our team will provide a fair
                market value for your current vehicle, which can be applied toward the purchase of
                your new car.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-8">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Can I schedule a test drive online?
              </h3>
              <p className="text-neutral/70">
                Absolutely! You can schedule a test drive through our website, by phone, or by
                contacting us through the form on this page. We'll confirm your appointment and have
                the vehicle ready when you arrive.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-8">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Do you offer any warranty on your vehicles?
              </h3>
              <p className="text-neutral/70">
                Yes, all our new vehicles come with the manufacturer's warranty. We also offer
                extended warranty options for both new and pre-owned vehicles to provide you with
                additional peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
