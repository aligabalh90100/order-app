import Modal from "./UI/Modal";
import { useContext } from "react";
import CartContext from "../store/CartContext";
import { currencyFormater } from "../util/formatting";
import Input from "./UI/Input";
import Button from "./UI/Button";
import UserProgressContext from "../store/UserProgressContext";
import Error from "./Error";
import useHttp from "../hooks/useHttp";
const requestConfig = {
  method: "POST",
  header: { "Content-Type": "application/json" },
};
export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userPrgoressCtx = useContext(UserProgressContext);
  const {
    data,
    isLoading: isSending,
    error,
    sendRequest,
  } = useHttp("http://localhost:3000/orders", requestConfig);
  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );
  function handleClose() {
    userPrgoressCtx.hideCheckout();
  }
  function handleSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const customerData = Object.fromEntries(fd.entries());
    sendRequest(
      JSON.stringify({
        order: { items: cartCtx.items, customer: customerData },
      })
    );
  }
  let actions = (
    <>
      <Button onClick={handleClose} type="button" textOnly>
        Close
      </Button>
      <Button>Submit Order</Button>
    </>
  );
  if (isSending) {
    actions = <span>Sending order data...</span>;
  }
  if (data) {
    return (
      <Modal
        open={userPrgoressCtx.progress === "checkout"}
        onClose={handleClose}
      >
        <h2>Success!</h2>
        <p>Your order was submited successfully</p>
        <p>
          We will get back to you with more details via email within the next
          few minutes.
        </p>
        <p className="modal-actions">
          <Button onClick={handleClose}>Okay</Button>
        </p>
      </Modal>
    );
  }
  return (
    <Modal open={userPrgoressCtx.progress === "checkout"} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <h2>Checkout</h2>
        <p>Total Amout :{currencyFormater.format(cartTotal)}</p>
        <Input label="Full Name" type="text" id="name" />
        <Input label="E-Mail Address" type="email" id="email" />
        <Input label="Street" type="text" id="street" />
        <div className="control-row">
          <Input label="Postal Code" type="text" id="postal-code" />
          <Input label="City" type="text" id="city" />
        </div>
        {error && <Error title="Failed to submit order" message={error} />}
        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
