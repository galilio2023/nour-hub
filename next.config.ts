import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
        {
            pathname: '/api/proxy-image',
            search: '?*',
        },
    ],
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'image.pollinations.ai',
        },
        {
            protocol: 'https',
            hostname: 'gen.pollinations.ai',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
        },
        {
            protocol: 'https',
            hostname: 'raw.githubusercontent.com',
        },
        {
            protocol: 'https',
            hostname: 'www.alsunna.org',
        }
    ]
  }
};

export default withNextIntl(nextConfig);
