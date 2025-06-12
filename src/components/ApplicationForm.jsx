import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, push, set } from '../firebase/config';
import { FormGroup, TextField, TextArea, Button } from './ui/FormElements';

function ApplicationForm({ carId, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad tələb olunur';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email tələb olunur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Düzgün email ünvanı daxil edin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon nömrəsi tələb olunur';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj tələb olunur';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mesaj ən azı 10 simvol olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Xahiş edirik bütün xanaları düzgün doldurun');
      return;
    }

    try {
      setLoading(true);

      // Check if user is authenticated
      if (!currentUser) {
        showError('Müraciət etmək üçün daxil olmalısınız');
        return;
      }

      // Create application data
      const applicationData = {
        ...formData,
        carId,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: Date.now(),
      };

      // Save application to database
      const applicationsRef = ref(database, 'applications');
      const newApplicationRef = push(applicationsRef);
      await set(newApplicationRef, applicationData);

      success('Müraciətiniz uğurla göndərildi');
      onClose();
    } catch (err) {
      console.error('Error submitting application:', err);
      showError('Müraciət göndərilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-2xl font-bold mb-6 text-neutral-dark">Avtomobil Almaq üçün Müraciət</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormGroup label="Ad" error={formTouched.name && errors.name} required>
          <TextField
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Adınızı daxil edin"
            required
          />
        </FormGroup>

        <FormGroup label="Email" error={formTouched.email && errors.email} required>
          <TextField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email ünvanınızı daxil edin"
            required
          />
        </FormGroup>

        <FormGroup label="Telefon" error={formTouched.phone && errors.phone} required>
          <TextField
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefon nömrənizi daxil edin"
            required
          />
        </FormGroup>

        <FormGroup label="Mesaj" error={formTouched.message && errors.message} required>
          <TextArea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Müraciətinizi daxil edin"
            rows={4}
            required
          />
        </FormGroup>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Göndərilir...' : 'Müraciət et'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ApplicationForm;
