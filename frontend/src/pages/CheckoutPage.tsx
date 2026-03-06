import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../contexts/CartContext';
import styles from './CheckoutPage.module.css';

interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onSubmit = (data: CheckoutFormData) => {
    // In a real app, this would submit to an API
    console.log('Checkout data:', data);
    console.log('Cart items:', state.items);
    console.log('Total:', total);

    // Clear cart and redirect
    dispatch({ type: 'CLEAR_CART' });
    navigate('/', { state: { checkoutSuccess: true } });
  };

  if (state.items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Checkout</h1>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h2>Shipping Information</h2>
          <div className={styles.field}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              {...register('name', { required: 'Name is required' })}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className={styles.error}>
                {errors.name.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.error}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              {...register('address', { required: 'Address is required' })}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <span id="address-error" className={styles.error}>
                {errors.address.message}
              </span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                {...register('city', { required: 'City is required' })}
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <span id="city-error" className={styles.error}>
                  {errors.city.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="state">State</label>
              <input
                id="state"
                {...register('state', { required: 'State is required' })}
                aria-describedby={errors.state ? 'state-error' : undefined}
              />
              {errors.state && (
                <span id="state-error" className={styles.error}>
                  {errors.state.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="zip">ZIP Code</label>
              <input
                id="zip"
                {...register('zip', {
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: 'Invalid ZIP code',
                  },
                })}
                aria-describedby={errors.zip ? 'zip-error' : undefined}
              />
              {errors.zip && (
                <span id="zip-error" className={styles.error}>
                  {errors.zip.message}
                </span>
              )}
            </div>
          </div>

          <h2>Payment Method</h2>
          <div className={styles.field}>
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              {...register('paymentMethod', { required: 'Payment method is required' })}
              aria-describedby={errors.paymentMethod ? 'payment-error' : undefined}
            >
              <option value="">Select payment method</option>
              <option value="credit-card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="apple-pay">Apple Pay</option>
            </select>
            {errors.paymentMethod && (
              <span id="payment-error" className={styles.error}>
                {errors.paymentMethod.message}
              </span>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Complete Order
          </button>
        </form>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.items}>
            {state.items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <div className={styles.itemInfo}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                  )}
                  <div>
                    <h4>{item.productName}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className={styles.total}>
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}