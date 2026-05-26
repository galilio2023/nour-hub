import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'ar'];

export default getRequestConfig(async (params) => {
  // next-intl might pass locale directly or inside requestLocale depending on version/setup
  let locale = params.locale;
  
  if (!locale) {
    locale = 'en';
  }

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as typeof locales[number])) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
