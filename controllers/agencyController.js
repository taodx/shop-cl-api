const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const Agency = require("../models/agencyModel");
const responseData = require("../utils/responseData");
const Product = require("../models/productModel");

exports.getAgencyByHomeAgentId = catchAsyncErrors(async (req, res, next) => {
  const { homeAgentId } = req.params;

  const agency = await Agency.findOne({ homeAgents: homeAgentId }).populate(
    "products.product"
  );

  if (!agency) {
    return next(new ErrorHander("Agency not found", 404));
  }

  responseData(agency, 200, "Lấy thông tin Agency thành công", res);
});

exports.updateProductPriceInAgency = catchAsyncErrors(async (req, res, next) => {
  const { homeAgentId, productId, newPrice } = req.body;

  // Tìm agency theo homeAgentId
  const agency = await Agency.findOne({ homeAgents: homeAgentId });

  if (!agency) {
    return next(new ErrorHander("Agency not found", 404));
  }

  // Tìm sản phẩm trong danh sách products của agency
  const product = agency.products.find((p) => p.product.equals(productId));

  if (!product) {
    return next(new ErrorHander("Product not found in agency", 404));
  }

  // Cập nhật giá sản phẩm trong Product collection
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { price: newPrice },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return next(new ErrorHander("Product not found", 404));
  }

  responseData(updatedProduct, 200, "Cập nhật giá sản phẩm thành công", res);
});