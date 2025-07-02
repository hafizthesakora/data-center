import './globals.css'; // Make sure this path is correct
import Providers from './components/Providers';

export const metadata = {
  title: 'Data Center Recording System',
  description: 'Cycle-based data recording and approval system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
