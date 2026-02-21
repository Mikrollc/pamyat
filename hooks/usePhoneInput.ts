import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPhoneInput, toE164, isValidPhone } from '@/lib/format-phone';
import { getDefaultCountry, type CountryCode } from '@/lib/country-data';

export function usePhoneInput(initialCountry?: CountryCode) {
  const { i18n, t } = useTranslation();

  const defaultCountry = useMemo(
    () => initialCountry ?? getDefaultCountry(i18n.language),
    [initialCountry, i18n.language],
  );

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [nationalNumber, setNationalNumber] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const formatted = useMemo(
    () => (nationalNumber ? formatPhoneInput(nationalNumber, country) : ''),
    [nationalNumber, country],
  );

  const e164 = useMemo(
    () => toE164(nationalNumber, country),
    [nationalNumber, country],
  );

  const isValid = useMemo(
    () => (nationalNumber ? isValidPhone(nationalNumber, country) : false),
    [nationalNumber, country],
  );

  const error = useMemo(() => {
    if (!nationalNumber || isValid) return '';
    if (nationalNumber.length >= 6) return t('auth.invalidPhone');
    return '';
  }, [nationalNumber, isValid, t]);

  function handleCountryChange(newCountry: CountryCode) {
    setCountry(newCountry);
    setNationalNumber('');
    setPickerOpen(false);
  }

  return {
    country,
    setCountry: handleCountryChange,
    nationalNumber,
    setNationalNumber,
    formatted,
    e164,
    isValid,
    error,
    pickerOpen,
    setPickerOpen,
  };
}
