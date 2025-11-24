import { useRef, useEffect } from 'react';

const DashboardCard = ({
  title,
  subTitle = "",
  value,
  icon,
  color = "primary",
  loading = false,
}) => {
  // Color mapping for solid circular icons
  const colorMap = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    info: '#0dcaf0',
    danger: '#dc3545',
  };

  const bgColor = colorMap[color] || colorMap.primary;

  const hexToRgba = (hex, alpha = 1) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Create a background with colored gradients on the left and right
  // and a white center (like the second attached image)
  // Use a light, full-width gradient (no solid white center) for a subtle colored background
  const leftColor = hexToRgba(bgColor, 0.08);
  const midColor = hexToRgba(bgColor, 0.03);
  const rightColor = hexToRgba(bgColor, 0.08);
  const gradientBg = `linear-gradient(90deg, ${leftColor} 0%, ${midColor} 50%, ${rightColor} 100%)`;
  // Keep last known non-null value so we can show it while loading (prevents placeholder flash)
  const lastValueRef = useRef(
    value !== null && typeof value !== 'undefined' ? value : null
  );

  useEffect(() => {
    if (value !== null && typeof value !== 'undefined') {
      lastValueRef.current = value;
    }
  }, [value]);

  const displayValue = loading
    ? (lastValueRef.current !== null && typeof lastValueRef.current !== 'undefined' ? lastValueRef.current : null)
    : (value !== null && typeof value !== 'undefined' ? value : 0);

  return (
    <div className="col-sm-6 col-xl-3">
      <div className="dashboard-card-professional card border-0 shadow-sm h-100" style={{ background: gradientBg }}>
        <div className="card-body d-flex align-items-center justify-content-between p-4" style={{ background: 'transparent' }}>
          <div className="card-icon me-3" style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 6px 16px ${bgColor}45`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <i className={`bi ${icon} text-white`} style={{ fontSize: '1.75rem' }}></i>
          </div>
          
          <div className="card-content flex-grow-1">
            <h6 className="card-title mb-2 text-muted fw-semibold" style={{ fontSize: '0.95rem', letterSpacing: '0.3px' }}>
              {title}
            </h6>
            {/* Preserve last known value while loading to avoid placeholder flash */}
            {displayValue === null ? (
              <div className="placeholder-glow">
                <span className="placeholder col-6" style={{ height: '36px', display: 'block' }}></span>
              </div>
            ) : (
              <h3 className="card-value mb-0 fw-bold text-dark" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {displayValue.toLocaleString()}
              </h3>
            )}
            {subTitle && (
              <small className="text-muted d-block mt-2" style={{ fontSize: '0.82rem' }}>
                {subTitle}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
