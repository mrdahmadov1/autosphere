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
      newErrors.name = 'Ad tələb olunur';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-poçt tələb olunur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-poçt düzgün deyil';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj tələb olunur';
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
      <section className="relative bg-neutral-dark py-32">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Bizimlə Əlaqə
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Suallarınız və ya köməyə ehtiyacınız var? Biz sizə kömək etmək üçün buradayıq!
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-dark mb-8 tracking-tight">
                Bizə Mesaj Göndərin
              </h2>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-8 py-10 rounded-2xl mb-8 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
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
                  <h3 className="text-xl font-bold mb-2 text-center">Təşəkkür Edirik!</h3>
                  <p className="text-center">
                    Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-neutral-dark font-medium mb-2">
                      Adınız <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:ring-2 focus:ring-primary/20 ${
                        errors.name
                          ? 'border-secondary'
                          : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Ad Soyad"
                    />
                    {errors.name && <p className="mt-2 text-secondary text-sm">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-neutral-dark font-medium mb-2">
                      E-poçt Ünvanı <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:ring-2 focus:ring-primary/20 ${
                        errors.email
                          ? 'border-secondary'
                          : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                      }`}
                      placeholder="example@mail.com"
                    />
                    {errors.email && <p className="mt-2 text-secondary text-sm">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-neutral-dark font-medium mb-2">
                      Telefon Nömrəsi
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                      placeholder="(123) 456-7890"
                    />
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-neutral-dark font-medium mb-2">
                      Nə ilə maraqlanırsınız?
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                    >
                      <option value="general">Ümumi Sorğu</option>
                      <option value="sales">Satış</option>
                      <option value="service">Xidmət Şöbəsi</option>
                      <option value="financing">Maliyyə Seçimləri</option>
                      <option value="testdrive">Test Sürüşü Təyin Et</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-neutral-dark font-medium mb-2">
                      Mesajınız <span className="text-secondary">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={`form-input w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 focus:ring-2 focus:ring-primary/20 ${
                        errors.message
                          ? 'border-secondary'
                          : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Sizə necə kömək edə bilərik?"
                    ></textarea>
                    {errors.message && (
                      <p className="mt-2 text-secondary text-sm">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 rounded-xl text-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Mesaj Göndər
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-dark mb-8 tracking-tight">
                Əlaqə Məlumatları
              </h2>

              <div className="bg-neutral-light rounded-2xl p-8 mb-8 shadow-sm">
                <div className="flex items-start mb-8 last:mb-0">
                  <div className="bg-white p-4 rounded-xl mr-5 shadow-sm">
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
                    <h3 className="text-lg font-bold text-neutral-dark mb-2">Ünvanımız</h3>
                    <p className="text-neutral/70 leading-relaxed">
                      123 Baş Küçə
                      <br />
                      Bakı şəhəri, AZ 1000
                      <br />
                      Azərbaycan
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-8 last:mb-0">
                  <div className="bg-white p-4 rounded-xl mr-5 shadow-sm">
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
                    <h3 className="text-lg font-bold text-neutral-dark mb-2">Telefon Nömrəsi</h3>
                    <p className="text-neutral/70 leading-relaxed">
                      Satış: (123) 456-7890
                      <br />
                      Xidmət: (123) 456-7891
                      <br />
                      Dəstək: (123) 456-7892
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-8 last:mb-0">
                  <div className="bg-white p-4 rounded-xl mr-5 shadow-sm">
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
                    <h3 className="text-lg font-bold text-neutral-dark mb-2">E-poçt Ünvanı</h3>
                    <p className="text-neutral/70 leading-relaxed">
                      info@autosphere.com
                      <br />
                      satis@autosphere.com
                      <br />
                      destek@autosphere.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white p-4 rounded-xl mr-5 shadow-sm">
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
                    <h3 className="text-lg font-bold text-neutral-dark mb-2">İş Saatları</h3>
                    <p className="text-neutral/70 leading-relaxed">
                      Bazar ertəsi - Cümə: 09:00 - 18:00
                      <br />
                      Şənbə: 10:00 - 16:00
                      <br />
                      Bazar: Bağlıdır
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-card h-80 bg-neutral-light flex items-center justify-center">
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
                    İnteraktiv Xəritə Burada Görünəcək
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-dark mb-16 tracking-tight">
            Tez-tez Soruşulan Suallar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-card p-8 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Hansı maliyyə seçimləri təklif edirsiniz?
              </h3>
              <p className="text-neutral/70 leading-relaxed">
                Biz standart kreditlər, lizing və müxtəlif kredit tarixçəsinə malik müştərilər üçün
                xüsusi maliyyə seçimləri təklif edirik. Maliyyə şöbəmiz büdcənizə uyğun ən yaxşı
                seçimi tapmaq üçün sizinlə əməkdaşlıq edəcək.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Köhnə avtomobilləri mübadiləyə qəbul edirsiniz?
              </h3>
              <p className="text-neutral/70 leading-relaxed">
                Bəli, biz bütün marka və modellərin mübadiləsini qəbul edirik. Komandamız mövcud
                avtomobiliniz üçün ədalətli bazar dəyəri təklif edəcək, bu da yeni avtomobilin
                alınmasına tətbiq edilə bilər.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Test sürüşünü onlayn təyin edə bilərəm?
              </h3>
              <p className="text-neutral/70 leading-relaxed">
                Əlbəttə! Test sürüşünü veb saytımız vasitəsilə, telefonla və ya bu səhifədəki
                formadan bizimlə əlaqə saxlayaraq təyin edə bilərsiniz. Təyinatınızı təsdiqləyəcək
                və gəldiyinizdə avtomobili hazır edəcəyik.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Avtomobillərinizə zəmanət təklif edirsiniz?
              </h3>
              <p className="text-neutral/70 leading-relaxed">
                Bəli, bütün yeni avtomobillərimiz istehsalçının zəmanəti ilə təmin edilir. Həmçinin
                həm yeni, həm də istifadə olunmuş avtomobillər üçün əlavə zəmanət seçimləri təklif
                edirik ki, sizə əlavə rahatlıq təmin edək.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
