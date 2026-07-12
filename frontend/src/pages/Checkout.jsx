import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Invoice States
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form input states
  const [coupon, setCoupon] = useState('WELCOME10');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentTab, setPaymentTab] = useState('Recommended');
  const [selectedMethodId, setSelectedMethodId] = useState('upi');
  
  // Payment progress states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const fetchCheckoutData = async (discountCode = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentAPI.checkout(courseId, discountCode, 'Card');
      if (res.success && res.data) {
        setInvoice(res.data);
        if (discountCode) {
          setAppliedCoupon(discountCode);
        }
      } else {
        throw new Error(res.message || 'Failed to initialize checkout');
      }
    } catch (err) {
      console.error('Error on checkout initialization', err);
      setError(err.message || 'Unable to prepare order invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-apply WELCOME10 by default to match screenshot invoice
    fetchCheckoutData('WELCOME10');
  }, [courseId]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    fetchCheckoutData(coupon.trim());
  };

  const handleRemoveCoupon = () => {
    setCoupon('');
    setAppliedCoupon('');
    fetchCheckoutData('');
  };

  const handleProcessPayment = async () => {
    if (!invoice?.orderId) return;

    setIsProcessing(true);
    setError('');

    // Simulate verification delay
    setTimeout(async () => {
      try {
        const res = await paymentAPI.verifyPayment(invoice.orderId, 'Completed');
        if (res.success) {
          setIsVerified(true);
        } else {
          throw new Error(res.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error', err);
        setError(err.message || 'Could not verify payment');
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (loading && !invoice) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="success-overlay animate-fade-in">
        <div className="success-card glass-panel animate-float">
          <div className="success-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-svg">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Payment Successful!</h2>
          <p className="success-msg">Your transaction was verified and you have been enrolled in <strong>{invoice?.courseTitle}</strong>.</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/my-courses/${courseId}`)}>Start Learning</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        </div>

        <style>{`
          .success-overlay {
            min-height: calc(100vh - var(--navbar-height) - 60px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .success-card {
            max-width: 480px;
            padding: 40px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            border-color: hsl(var(--accent-green) / 0.3);
            box-shadow: 0 10px 40px rgba(46, 213, 115, 0.05);
          }

          .success-icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background-color: hsl(var(--accent-green) / 0.1);
            color: hsl(var(--accent-green));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
          }

          .success-card h2 {
            font-size: 1.6rem;
          }

          .success-msg {
            color: hsl(var(--text-secondary));
            line-height: 1.5;
            font-size: 0.9rem;
          }

          .success-actions {
            display: flex;
            gap: 12px;
            width: 100%;
          }

          .success-actions button {
            flex: 1;
          }
        `}</style>
      </div>
    );
  }

  // Payment methods list corresponding to screenshot
  const paymentMethods = [
    {
      id: 'upi',
      tab: 'UPI',
      title: 'UPI (Recommended)',
      desc: 'Pay using any UPI app',
      logos: [
        'https://www.svgrepo.com/show/503046/google-pay.svg',
        'https://www.svgrepo.com/show/368897/phonepe.svg',
        'https://www.svgrepo.com/show/354173/paytm.svg',
        'https://www.svgrepo.com/show/448259/bhim.svg'
      ],
      fields: (
        <div className="card-form animate-fade-in" style={{ padding: 0, marginTop: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Enter UPI ID</label>
            <input type="text" className="form-control" placeholder="arshad@okaxis" defaultValue="arshad@okaxis" />
          </div>
        </div>
      )
    },
    {
      id: 'card',
      tab: 'Cards',
      title: 'Credit / Debit Card',
      desc: 'Visa, Mastercard, RuPay & more',
      logos: [
        'https://www.svgrepo.com/show/508722/visa.svg',
        'https://www.svgrepo.com/show/508699/mastercard.svg',
        'https://www.svgrepo.com/show/476251/rupay.svg'
      ],
      fields: (
        <div className="card-form animate-fade-in" style={{ padding: 0, marginTop: '14px' }}>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input type="text" className="form-control" placeholder="4111 2222 3333 4444" defaultValue="4111 2222 3333 4444" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expiry Date</label>
              <input type="text" className="form-control" placeholder="MM/YY" defaultValue="12/28" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CVV</label>
              <input type="password" className="form-control" placeholder="•••" defaultValue="123" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'netbanking',
      tab: 'Net Banking',
      title: 'Net Banking',
      desc: 'Pay using your bank account',
      logos: [],
      fields: (
        <div className="upi-form animate-fade-in" style={{ padding: 0, marginTop: '14px' }}>
          <label className="form-label">Select Your Bank</label>
          <select className="form-control">
            <option>SBI Bank</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
          </select>
        </div>
      )
    },
    {
      id: 'wallets',
      tab: 'Wallets',
      title: 'Wallets',
      desc: 'Paytm, PhonePe, Amazon Pay & more',
      logos: [
        'https://www.svgrepo.com/show/354173/paytm.svg',
        'https://www.svgrepo.com/show/368897/phonepe.svg',
        'https://www.svgrepo.com/show/353391/amazon-pay.svg'
      ],
      fields: <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>You will be redirected to your wallet provider.</p>
    },
    {
      id: 'emi',
      tab: 'EMI',
      title: 'EMI / Buy Now Pay Later',
      desc: 'Easy EMI options available',
      logos: [
        'https://www.svgrepo.com/show/354593/zest.svg',
        'https://www.svgrepo.com/show/476313/simpl.svg'
      ],
      fields: <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Choose EMI provider on next screen.</p>
    }
  ];

  const sidebarTabs = ['Recommended', 'UPI', 'Cards', 'Net Banking', 'Wallets', 'EMI'];

  return (
    <div className="checkout-wrapper animate-fade-in">
      
      {/* Top security header bar (matches Image 3) */}
      <div className="checkout-top-header glass-panel">
        <div className="logo-sec">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          <span>CareerHub</span>
        </div>
        <div className="security-labels">
          <span className="sec-label">🔒 Secure Payment</span>
          <span className="sec-desc">Your payment information is encrypted and secure</span>
        </div>
        <div className="ssl-badge">
          <span>100% Secure SSL Encryption</span>
        </div>
      </div>

      <div className="checkout-breadcrumb" style={{ margin: '14px 0' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>&larr; Back to Dashboard</Link>
      </div>

      {/* Main Grid split */}
      <div className="checkout-grid">
        
        {/* Left Column: Order Summary */}
        <div className="summary-column glass-panel">
          <h3>Order Summary</h3>
          <p className="subtitle">Summary of items in your cart.</p>

          <div className="checkout-item-preview-row">
            <div className="thumbnail-box-blue">
              <span>UI/UX DESIGN</span>
            </div>
            <div className="preview-details">
              <h4>{invoice?.courseTitle || 'UI/UX Design Mastercourse'}</h4>
              <p>By CareerHub</p>
            </div>
          </div>

          <div className="invoice-prices" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className="price-row">
              <span>Course Price</span>
              <span>₹ {invoice?.basePrice || 1499}</span>
            </div>
            
            {invoice?.discountAmount > 0 && (
              <div className="price-row green-row">
                <span>Discount ({appliedCoupon || 'WELCOME10'})</span>
                <span>- ₹ {invoice?.discountAmount}</span>
              </div>
            )}
            
            <div className="price-row">
              <span>GST (18%)</span>
              <span>₹ {invoice?.gstAmount || 242.82}</span>
            </div>
            
            <div className="price-row total-row">
              <span>Total Amount</span>
              <span>₹ {invoice?.totalAmount || 1591.82}</span>
            </div>
          </div>

          {invoice?.discountAmount > 0 && (
            <div className="saving-badge-container">
              <span>💡 You are saving ₹ {invoice?.discountAmount} on this order!</span>
            </div>
          )}

          {/* Checkout features list */}
          <div className="checkout-feature-list">
            <div className="feature-item">
              <span className="icon">♾️</span>
              <div>
                <strong>Lifetime Access</strong>
                <p>Learn at your own pace</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="icon">🎓</span>
              <div>
                <strong>Certificate of Completion</strong>
                <p>Shareable certificate</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="icon">🛡️</span>
              <div>
                <strong>30-Day Money Back</strong>
                <p>Full refund if not satisfied</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="icon">🔒</span>
              <div>
                <strong>Secure Payments</strong>
                <p>Multiple safe payment options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Select Payment Method Card with Tabs List */}
        <div className="payment-column" style={{ padding: 0 }}>
          
          <div className="checkout-method-card glass-panel">
            {/* Sub-sidebar tabs list */}
            <div className="checkout-tabs-list">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab}
                  className={`checkout-tab-item ${paymentTab === tab ? 'active' : ''}`}
                  onClick={() => setPaymentTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Details side */}
            <div className="checkout-tab-details">
              
              {isProcessing ? (
                <div className="processing-loader" style={{ padding: '60px 0' }}>
                  <div className="spinner"></div>
                  <p>Processing secure payment...</p>
                  <span>Please do not close or refresh this page.</span>
                </div>
              ) : (
                <div className="payment-rows-container">
                  {paymentMethods
                    .filter((method) => paymentTab === 'Recommended' || method.tab === paymentTab)
                    .map((method) => {
                      const isExpanded = selectedMethodId === method.id;

                      return (
                        <div key={method.id} className="payment-row-expandable">
                          <button
                            className="payment-row-header"
                            onClick={() => setSelectedMethodId(method.id)}
                            type="button"
                          >
                            <div className="payment-row-left">
                              <input
                                type="radio"
                                checked={isExpanded}
                                onChange={() => setSelectedMethodId(method.id)}
                              />
                              <div className="option-label" style={{ textAlign: 'left' }}>
                                <strong style={{ fontSize: '0.85rem' }}>{method.title}</strong>
                                <span style={{ fontSize: '0.75rem' }}>{method.desc}</span>
                              </div>
                            </div>

                            {method.logos?.length > 0 && (
                              <div className="payment-brand-logos">
                                {method.logos.map((logo, idx) => (
                                  <img key={idx} src={logo} alt="brand" className="payment-brand-logo" />
                                ))}
                              </div>
                            )}
                          </button>

                          {isExpanded && (
                            <div style={{ padding: '0 20px 20px', borderTop: '1px solid hsl(var(--border-color) / 0.3)' }}>
                              {method.fields}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {error && <p className="payment-error-msg" style={{ marginTop: '16px' }}>{error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Total Amount secure button bar */}
          {!isProcessing && (
            <div className="checkout-bottom-cta-bar glass-panel animate-slide-up">
              <div className="cta-left">
                <span className="label">Total Amount</span>
                <span className="price">₹ {invoice?.totalAmount || 1591.82}</span>
                <span className="tax-label">Inclusive of all taxes</span>
              </div>

              <div className="cta-right">
                <button className="btn btn-primary glow-btn pay-securely-btn" onClick={handleProcessPayment}>
                  🔒 Pay ₹ {invoice?.totalAmount || 1591.82} Securely
                </button>
                <p className="cta-agreement">By completing this payment, you agree to our <a href="/dashboard">Terms of Use</a> & <a href="/dashboard">Privacy Policy</a></p>
              </div>
            </div>
          )}

        </div>

      </div>

      <style>{`
        /* Security Header */
        .checkout-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 30px;
          border-radius: var(--radius-sm);
        }

        .checkout-top-header .logo-sec {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.2rem;
        }

        .checkout-top-header .logo-sec svg {
          color: hsl(var(--primary));
        }

        .security-labels {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .sec-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
        }

        .sec-desc {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
        }

        .ssl-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
        }

        /* Summary Column Item */
        .checkout-item-preview-row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid hsl(var(--border-color));
        }

        .thumbnail-box-blue {
          width: 90px;
          height: 60px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.55rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .preview-details h4 {
          font-size: 1rem;
          line-height: 1.25;
        }

        .preview-details p {
          font-size: 0.8rem;
          color: hsl(var(--text-secondary));
        }

        .saving-badge-container {
          background-color: hsl(var(--accent-green) / 0.08);
          border: 1px dashed hsl(var(--accent-green) / 0.3);
          color: hsl(var(--accent-green));
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          margin: 16px 0 24px;
        }

        .checkout-feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-top: 1px solid hsl(var(--border-color));
          padding-top: 20px;
        }

        .feature-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .feature-item .icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .feature-item div strong {
          font-size: 0.85rem;
          color: hsl(var(--text-primary));
        }

        .feature-item div p {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
        }

        /* Bottom CTA bar */
        .checkout-bottom-cta-bar {
          margin-top: 20px;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cta-left {
          display: flex;
          flex-direction: column;
        }

        .cta-left .label {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          text-transform: uppercase;
        }

        .cta-left .price {
          font-family: var(--font-title);
          font-size: 1.6rem;
          font-weight: 800;
          color: hsl(var(--text-primary));
          line-height: 1.1;
        }

        .cta-left .tax-label {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
        }

        .cta-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .pay-securely-btn {
          padding: 12px 30px;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
        }

        .cta-agreement {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
        }

        .cta-agreement a {
          color: hsl(var(--primary));
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .checkout-bottom-cta-bar {
            flex-direction: column;
            gap: 16px;
            align-items: center;
            text-align: center;
          }
          .cta-right {
            align-items: center;
          }
          .checkout-top-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
