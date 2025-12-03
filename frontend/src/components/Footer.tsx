import React from 'react';
import '../styles/footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Hakkında</h3>
            <p>GençBizz, öğrenciler için haber ve proje paylaşım platformudur.</p>
          </div>

          <div className="footer-section">
            <h3>Bağlantılar</h3>
            <ul>
              <li><a href="/">Haberler</a></li>
              <li><a href="/forum">Forum</a></li>
              <li><a href="/privacy">Gizlilik Politikası</a></li>
              <li><a href="/terms">Kullanım Şartları</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>İletişim</h3>
            <ul>
              <li><a href="mailto:info@gencbizz.com">info@gencbizz.com</a></li>
              <li><a href="https://twitter.com/gencbizz">Twitter</a></li>
              <li><a href="https://instagram.com/gencbizz">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 GençBizz. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};
