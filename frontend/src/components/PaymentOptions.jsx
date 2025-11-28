import React from "react";

const PaymentOptions = ({ product, selectedVariant }) => {
  // Calculate if payment options should be displayed
  const installmentMonths = product?.installment_months || 0;
  const enableMintpay = product?.enable_mintpay || false;
  const enableKoko = product?.enable_koko || false;

  // Get the final price (after discount)
  const getFinalPrice = () => {
    if (!product || !product.price) return 0;
    const basePrice = parseFloat(product.price) || 0;

    // For ProductDetailPage: Use selected variant's discounted price if available
    if (selectedVariant) {
      const productDiscount = product.discount_percentage || 0;
      const variantDiscount = selectedVariant.discount_percentage || 0;
      // Use the higher discount (variant discount takes precedence if higher)
      const effectiveDiscount =
        variantDiscount > productDiscount ? variantDiscount : productDiscount;
      return basePrice * (1 - effectiveDiscount / 100);
    }

    // For listing pages: Use min_discounted_price if available (product has discount)
    if (product.hasDiscount && product.min_discounted_price) {
      return parseFloat(product.min_discounted_price) || 0;
    }

    // Fallback: Calculate from product-level discount
    const discount = product.discount_percentage || 0;
    return basePrice * (1 - discount / 100);
  };

  const finalPrice = getFinalPrice();
  const installmentAmount =
    installmentMonths > 0 ? finalPrice / installmentMonths : 0;

  // Don't display if no payment options are enabled
  if (installmentMonths === 0 || (!enableMintpay && !enableKoko)) {
    return null;
  }

  return (
    <div className="mt-3 text-sm md:text-base">
      <div className="text-gray-400 mb-1">or</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white">
          {installmentMonths} x Rs{" "}
          {installmentAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          with
        </span>
        <div className="flex items-center gap-2">
          {enableMintpay && (
            <img
              src="/mintpay.png"
              alt="Mintpay"
              className="h-5 md:h-6 object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = "none";
                if (!e.target.nextSibling) {
                  const span = document.createElement("span");
                  span.className = "text-white font-semibold";
                  span.textContent = "Mintpay";
                  e.target.parentNode.appendChild(span);
                }
              }}
            />
          )}
          {enableMintpay && enableKoko && (
            <span className="text-white">or</span>
          )}
          {enableKoko && (
            <img
              src="/koko.png"
              alt="KOKO"
              className="h-5 md:h-6 object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = "none";
                if (!e.target.nextSibling) {
                  const span = document.createElement("span");
                  span.className = "text-white font-semibold";
                  span.textContent = "KOKO";
                  e.target.parentNode.appendChild(span);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
