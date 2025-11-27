import Providers from './providers';
import './globals.css';

export const metadata = {
    title: 'E-Commerce Store',
    description: 'Shop the latest products',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
