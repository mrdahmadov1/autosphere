import { useState } from 'react';
import PropTypes from 'prop-types';
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
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad daxil edilməlidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email daxil edilməlidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Düzgün email daxil edin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon nömrəsi daxil edilməlidir';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj daxil edilməlidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create application data
      const applicationData = {
        carId,
        userId: currentUser.uid,
        userName: currentUser.displayName || formData.name,
        userEmail: currentUser.email || formData.email,
        phone: formData.phone,
        message: formData.message,
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
      showError('Müraciət göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-dark">Müraciət Et</h2>
        <button
          onClick={onClose}
          className="text-neutral/70 hover:text-neutral-dark transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup label="Ad" error={formTouched.name && errors.name} required>
          <TextField
            type="text"
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
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3"
          >
            Ləğv et
          </Button>
          <Button type="submit" disabled={loading} className="px-6 py-3">
            {loading ? 'Göndərilir...' : 'Müraciət et'}
          </Button>
        </div>
      </form>
    </div>
  );
}

ApplicationForm.propTypes = {
  carId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApplicationForm;
