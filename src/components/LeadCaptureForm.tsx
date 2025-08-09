import { useState } from 'react';
import { Mail, User, CheckCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateLeadForm, ValidationError } from '@/lib/validation';
import { useLeadStore } from '@/lib/lead-store';

type FormState = {
  name: string;
  email: string;
  industry: string;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const LeadCaptureController = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    industry: ''
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [status, setStatus] = useState<FormStatus>('idle');
  const { leads, addLead } = useLeadStore();

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLeadForm(form);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('https://ytyopyznqpnylebzibby.supabase.co/functions/v1/clever-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eW9weXpucXBueWxlYnppYmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI3NTUsImV4cCI6MjA3MDEyODc1NX0.nr9WV_ybqZ6PpWT6GjAQm0Bsdr-Q5IejEhToV34VY4E`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Submission failed');

      await addLead({
        ...form,
        submitted_at: new Date().toISOString()
      });

      setStatus('success');
      setForm({ name: '', email: '', industry: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  const resetForm = () => {
    setStatus('idle');
  };

  return (
    <LeadCaptureView
      form={form}
      errors={errors}
      status={status}
      leadCount={leads.length}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      onReset={resetForm}
    />
  );
};

const LeadCaptureView = ({
  form,
  errors,
  status,
  leadCount,
  onFieldChange,
  onSubmit,
  onReset
}: {
  form: FormState;
  errors: ValidationError[];
  status: FormStatus;
  leadCount: number;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}) => {
  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You're #{leadCount} on our waitlist
          </p>
          <Button onClick={onReset} variant="outline" className="w-full">
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Join Our Waitlist</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Get early access to our product
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              icon={<User className="w-5 h-5" />}
              type="text"
              field="name"
              value={form.name}
              onChange={onFieldChange}
              error={getError('name')}
              placeholder="Full name"
            />

            <FormField
              icon={<Mail className="w-5 h-5" />}
              type="email"
              field="email"
              value={form.email}
              onChange={onFieldChange}
              error={getError('email')}
              placeholder="Email address"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <Select
                value={form.industry}
                onValueChange={(val) => onFieldChange('industry', val)}
              >
                <SelectTrigger className={`w-full ${getError('industry') ? 'border-red-500' : ''}`}>
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                    <SelectValue placeholder="Select industry" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Other'].map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError('industry') && (
                <p className="text-sm text-red-500 mt-1">{getError('industry')}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting...' : 'Join Waitlist'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  icon,
  type,
  field,
  value,
  onChange,
  error,
  placeholder
}: {
  icon: React.ReactNode;
  type: string;
  field: keyof FormState;
  value: string;
  onChange: (field: keyof FormState, value: string) => void;
  error?: string;
  placeholder: string;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {field.charAt(0).toUpperCase() + field.slice(1)}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={`pl-10 ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

export default LeadCaptureController;