import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

// Category to Types mapping
const categoryTypes = {
  Rackets: ["Attack", "Control", "Speed", "Starting"],
  Shuttlecocks: ["Nylon", "Feather", "Hybrid (3in1)"],
  Strings: ["Control", "Durability", "Quick Repulsion"],
  Shoes: ["Yonex Tru Cushion", "Yonex Power Cushion"],
  Clothing: ["T-Shirts", "Shorts", "Skirt", "Vest"],
  Grips: [],
  Bags: [],
  Headbands: [],
  Wristbands: [],
};

// Category to variant fields mapping
const categoryVariantFields = {
  Rackets: { showSize: false, showGripSize: true, gripSizeLabel: "Grip Size" },
  Shuttlecocks: { showSize: false, showGripSize: true, gripSizeLabel: "Speed" },
  Strings: { showSize: false, showGripSize: false, gripSizeLabel: "Grip Size" },
  Grips: { showSize: false, showGripSize: false, gripSizeLabel: "Grip Size" },
  Bags: { showSize: true, showGripSize: false, gripSizeLabel: "Grip Size" },
  Shoes: { showSize: true, showGripSize: false, gripSizeLabel: "Grip Size" },
  Clothing: { showSize: true, showGripSize: false, gripSizeLabel: "Grip Size" },
  Headbands: {
    showSize: true,
    showGripSize: false,
    gripSizeLabel: "Grip Size",
  },
  Wristbands: {
    showSize: true,
    showGripSize: false,
    gripSizeLabel: "Grip Size",
  },
};

const AdminPanel = () => {
  const [productImages, setProductImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    long_description: "",
    category: "",
    collection: "",
    type: "",
        price: 0,
    discount_percentage: 0,
    out_of_stock: false,
    installment_months: 0,
    enable_mintpay: false,
    enable_koko: false,
    specs: {},
    selectedColors: [], // Multi-select colors at product level
    colorVariants: {}, // Structure: { color: { image_url, discount_percentage, sizes: { size: stock }, grip_sizes: { grip_size: stock } } }
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [currentView, setCurrentView] = useState("products"); // "products" or "add"
  const [banners, setBanners] = useState([]);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const navigate = useNavigate();

  // Dynamic lists for dropdowns
  const [collectionsList, setCollectionsList] = useState([
    "Yonex",
    "Young",
    "Yang Yang",
    "Kawasaki",
    "taan",
    "Li-Ning",
  ]);
  const [typesList, setTypesList] = useState({});
  const [colorsList, setColorsList] = useState([
    "Default",
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Gray",
    "Silver",
    "Gold",
    "Navy",
    "Royal Blue",
    "Sky Blue",
    "Lime Green",
    "Neon Yellow",
    "Fluorescent Green",
    "Maroon",
    "Teal",
    "Turquoise",
    "Violet",
    "Magenta",
    "Beige",
    "Brown",
  ]);
  const [sizesList, setSizesList] = useState({
    Shoes: [
      "39.5EUR/6.5UK/7US",
      "40EUR/7UK/7.5US",
      "40.5EUR/7.5UK/8US",
      "41EUR/8UK/8.5US",
      "42EUR/8.5UK/9US",
      "43EUR/9UK/9.5US",
      "44EUR/9.5UK/10US",
      "44.5EUR/10UK/10.5US",
      "45EUR/10.5UK/11US",
      "45.5EUR/11UK/11.5US",
    ],
    Clothing: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    Bags: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    Headbands: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    Wristbands: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  });
  const [gripSizesList, setGripSizesList] = useState({
    Rackets: [
      "2U/G1",
      "2U/G2",
      "2U/G3",
      "3U/G1",
      "3U/G2",
      "3U/G3",
      "3U/G4",
      "4U/G1",
      "4U/G2",
      "4U/G3",
      "4U/G4",
      "4U/G5",
      "5U/G2",
      "5U/G3",
      "5U/G4",
      "5U/G5",
      "6U/G3",
      "6U/G4",
      "6U/G5",
      "6U/G6",
    ],
    Shuttlecocks: [
      { value: "75", label: "75 (Slowest)" },
      { value: "76", label: "76 (Slow)" },
      { value: "77", label: "77 (Medium)" },
      { value: "78", label: "78 (Fast)" },
      { value: "79", label: "79 (Fastest)" },
    ],
  });

  // State for showing "Add New" input fields
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [showAddColor, setShowAddColor] = useState(false);
  const [showAddSize, setShowAddSize] = useState({});
  const [showAddGripSize, setShowAddGripSize] = useState({});

  // Temporary values for new items
  const [newCollection, setNewCollection] = useState("");
  const [newType, setNewType] = useState("");
  const [newColor, setNewColor] = useState({});
  const [newSize, setNewSize] = useState({});
  const [newGripSize, setNewGripSize] = useState({});

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/admin/check-auth", {
          withCredentials: true,
        });
        setIsLoggedIn(response.data.authenticated);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/admin/login", loginData, {
        withCredentials: true,
      });
      setIsLoggedIn(true);
      setError("");
      fetchProducts();
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleGenerateBackup = async () => {
    setBackupLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/admin/backup/generate", {
        withCredentials: true,
        responseType: "blob", // Important for file download
      });

      // Create a blob with proper MIME type for Excel
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "products_backup.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Ensure filename has .xlsx extension
      if (!filename.toLowerCase().endsWith('.xlsx')) {
        filename = filename.replace(/\.[^/.]+$/, '') + '.xlsx';
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      setError("");
      alert("Backup generated and downloaded successfully!");
    } catch (err) {
      console.error("Backup generation failed:", err);
      setError("Failed to generate backup: " + (err.response?.data?.error || err.message));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      setError("Please select a file to restore");
      return;
    }

    setRestoreLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", restoreFile);

    try {
      const response = await axios.post(
        "/api/admin/backup/restore",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Close modal and refresh products
      setShowRestoreModal(false);
      setRestoreFile(null);
      await fetchProducts();
      
      alert(
        `Backup restored successfully! ${response.data.products_restored} products restored.`
      );
      setError("");
    } catch (err) {
      console.error("Restore failed:", err);
      console.error("Error response:", err.response);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error occurred";
      setError(`Failed to restore backup: ${errorMessage}`);
      
      // Log full error details for debugging
      if (err.response?.data) {
        console.error("Error details:", err.response.data);
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/banners`);
      console.log("Banners fetched:", response.data);
      setBanners(response.data || []);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setBanners([]);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBanners();
    }
  }, [isLoggedIn]);

  // Also fetch banners when switching to banners view
  useEffect(() => {
    if (isLoggedIn && currentView === "banners") {
      fetchBanners();
    }
  }, [currentView, isLoggedIn]);

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBannerImageUploading(true);
    setError(""); // Clear any previous errors
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading banner image...");
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/admin/upload-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = uploadResponse.data.image_url;
      console.log("Image uploaded, URL:", imageUrl);

      // Add banner to database
      console.log("Adding banner to database...");
      await axios.post(
        `${API_BASE_URL}/api/banners`,
        { image_url: imageUrl, display_order: banners.length },
        { withCredentials: true }
      );

      console.log("Banner added, refreshing list...");
      await fetchBanners();
      e.target.value = ""; // Reset input
    } catch (err) {
      console.error("Error uploading banner:", err);
      setError(err.response?.data?.error || "Failed to upload banner image");
    } finally {
      setBannerImageUploading(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/banners/${bannerId}`, {
        withCredentials: true,
      });
      await fetchBanners();
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError("Failed to delete banner");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      long_description: "",
      category: "",
      collection: "",
      type: "",
          price: 0,
      discount_percentage: 0,
      out_of_stock: false,
      installment_months: 0,
      enable_mintpay: false,
      enable_koko: false,
      specs: {},
      selectedColors: [],
      colorVariants: {},
    });

    setProductImages([]);
    setMainImageIndex(0);
    setEditingId(null);
    setCurrentView("products"); // Switch back to products view
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // If category changed, clear type and variant fields that are no longer relevant
      if (name === "category") {
        updated.type = "";
        // Clear size/grip_size from colorVariants if they won't be shown
          const variantFields = categoryVariantFields[value] || {};
        const newColorVariants = { ...updated.colorVariants };
          
        Object.keys(newColorVariants).forEach((color) => {
          if (!variantFields.showSize) {
            newColorVariants[color].sizes = {};
          }
          if (!variantFields.showGripSize) {
            newColorVariants[color].grip_sizes = {};
          }
        });

        updated.colorVariants = newColorVariants;
      }
      
      return updated;
    });
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [newSpecKey]: newSpecValue,
        },
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData((prev) => ({
      ...prev,
      specs: newSpecs,
    }));
  };

  // Helper function to generate variants array from colorVariants structure for backend
  const generateVariantsFromColors = () => {
    const variants = [];
    if (!formData.selectedColors || formData.selectedColors.length === 0) {
      return variants;
    }
    formData.selectedColors.forEach((color) => {
      const colorVariant = formData.colorVariants[color] || {
        image_url: "",
        discount_percentage: 0,
        sizes: {},
        grip_sizes: {},
      };

      // Generate variants for each size/grip_size combination
      const sizes = Object.keys(colorVariant.sizes || {});
      const gripSizes = Object.keys(colorVariant.grip_sizes || {});

      if (sizes.length > 0 && gripSizes.length > 0) {
        // Both sizes and grip sizes
        sizes.forEach((size) => {
          gripSizes.forEach((gripSize) => {
            variants.push({
              color,
              image_url: colorVariant.image_url || "",
              stock: colorVariant.sizes[size] || 0,
              size,
              grip_size: gripSize,
              discount_percentage: colorVariant.discount_percentage || 0,
            });
          });
        });
      } else if (sizes.length > 0) {
        // Only sizes
        sizes.forEach((size) => {
          variants.push({
            color,
            image_url: colorVariant.image_url || "",
            stock: colorVariant.sizes[size] || 0,
            size,
            grip_size: "",
            discount_percentage: colorVariant.discount_percentage || 0,
          });
        });
      } else if (gripSizes.length > 0) {
        // Only grip sizes
        gripSizes.forEach((gripSize) => {
          variants.push({
            color,
            image_url: colorVariant.image_url || "",
            stock: colorVariant.grip_sizes[gripSize] || 0,
            size: "",
            grip_size: gripSize,
            discount_percentage: colorVariant.discount_percentage || 0,
          });
        });
      } else {
        // No sizes or grip sizes - just color variant
        variants.push({
          color,
          image_url: colorVariant.image_url || "",
          stock: 1,
          size: "",
          grip_size: "",
          discount_percentage: colorVariant.discount_percentage || 0,
        });
      }
    });
    return variants;
  };

  const handleColorImageUpload = async (productName, file, color) => {
    if (!file) return;

    setImageUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("product_name", productName);

    try {
      const response = await axios.post(
        "/api/admin/upload-image",
        uploadFormData,
        {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        }
      );

      // Update the color variant's image_url
      setFormData((prev) => ({
        ...prev,
        colorVariants: {
          ...prev.colorVariants,
          [color]: {
            ...(prev.colorVariants[color] || {
              discount_percentage: 0,
              sizes: {},
              grip_sizes: {},
            }),
          image_url: response.data.image_url,
          },
        },
      }));
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleProductImageUpload = async (productName, file) => {
    if (!file) return;

    setImageUploading(true);
    setImageUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("product_name", productName);

    try {
      const response = await axios.post("/api/admin/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setImageUploadProgress(percentCompleted);
        },
      });

      setProductImages((prev) => [
        ...prev,
        {
          image_url: response.data.image_url,
          is_main: false,
        },
      ]);

      // If this is the first image, set it as main by default
      if (productImages.length === 0) {
        setMainImageIndex(0);
      }

      return response.data.image_url;
    } catch (err) {
      setError("Failed to upload product image");
      throw err;
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  const removeProductImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));

    // Adjust main image index if needed
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate variants from colorVariants structure
      const variants = generateVariantsFromColors();

      const productData = {
        name: formData.name,
        long_description: formData.long_description,
        category: formData.category,
        collection: formData.collection,
        type: formData.type,
        price: formData.price,
        discount_percentage: formData.discount_percentage || 0,
        out_of_stock: formData.out_of_stock || false,
        installment_months: formData.installment_months || 0,
        enable_mintpay: formData.enable_mintpay || false,
        enable_koko: formData.enable_koko || false,
        specs: formData.specs,
        description: "product", // Placeholder value
        product_images: productImages.map((img, index) => ({
          ...img,
          is_main: index === mainImageIndex,
        })),
        variants,
      };

      if (editingId) {
        await axios.put(`/api/admin/products/${editingId}`, productData, {
          withCredentials: true,
        });
      } else {
        await axios.post("/api/admin/products", productData, {
          withCredentials: true,
        });
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setCurrentView("add"); // Switch to add view when editing

    // Handle specs parsing with proper error handling
    let parsedSpecs = {};
    if (product.specs) {
      try {
        parsedSpecs =
          typeof product.specs === "string"
            ? JSON.parse(product.specs)
            : product.specs;

        // Ensure we have a proper object
        if (typeof parsedSpecs !== "object" || parsedSpecs === null) {
          parsedSpecs = {};
        }
      } catch (e) {
        console.error("Error parsing specs:", e);
        parsedSpecs = {};
      }
    }

    setFormData({
      name: product.name,
      long_description: product.long_description || "",
      category: product.category,
      collection: product.collection || "",
      type: product.type || "",
      price: product.price || 0,
      discount_percentage: product.discount_percentage || 0,
      out_of_stock: product.out_of_stock || false,
      installment_months: product.installment_months || 0,
      enable_mintpay: product.enable_mintpay || false,
      enable_koko: product.enable_koko || false,
      specs: parsedSpecs,
      selectedColors: [],
      colorVariants: {},
    });

    // Fetch complete product data with variants and images
    setLoading(true);
    axios
      .get(`/api/products/${product.id}`)
      .then((response) => {
        // Set product images
        setProductImages(response.data.product_images || []);

        // Find the index of the main image
        const mainImgIndex = response.data.product_images
          ? response.data.product_images.findIndex((img) => img.is_main)
          : -1;
        setMainImageIndex(mainImgIndex >= 0 ? mainImgIndex : 0);

        // Convert variants to colorVariants structure
        const colorVariantsMap = {};
        const uniqueColors = new Set();

        response.data.variants.forEach((v) => {
          const color = v.color || "";
          if (!color) return;

          uniqueColors.add(color);

          if (!colorVariantsMap[color]) {
            colorVariantsMap[color] = {
              image_url: v.image_url || "",
              discount_percentage: v.discount_percentage || 0,
              sizes: {},
              grip_sizes: {},
            };
          }

          // Add size with stock status
          if (v.size && v.size !== "" && v.size !== "None") {
            colorVariantsMap[color].sizes[v.size] = v.stock > 0 ? 1 : 0;
          }

          // Add grip_size with stock status
          if (v.grip_size && v.grip_size !== "" && v.grip_size !== "None") {
            colorVariantsMap[color].grip_sizes[v.grip_size] =
              v.stock > 0 ? 1 : 0;
          }
        });

        setFormData((prev) => ({
          ...prev,
          selectedColors: Array.from(uniqueColors),
          colorVariants: colorVariantsMap,
        }));
      })
      .catch((err) => {
        setError("Failed to load product data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/products/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const markOutOfStock = async (id) => {
    if (
      !window.confirm(
        "Mark this product as out of stock? This will make the entire product unavailable."
      )
    )
      return;
    setLoading(true);
    try {
      await axios.put(
        `/api/admin/products/${id}`,
        {
          out_of_stock: true,
        },
        {
          withCredentials: true,
        }
      );
      fetchProducts();
    } catch (err) {
      setError("Failed to mark product as out of stock");
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
          <img
              src="/logo.png"
            alt="Company Logo"
              className="h-12 md:h-16 w-auto mb-4"
          />
            <h2 className="text-2xl md:text-3xl font-bold bg-[#70d4fe] bg-clip-text text-transparent">
              Admin Login
            </h2>
        </div>
          {error && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm md:text-base">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Username:
              </label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              required
                className="w-full px-4 py-3 md:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent text-base md:text-lg transition-all text-gray-900"
            />
          </div>
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Password:
              </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
                className="w-full px-4 py-3 md:py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent text-base md:text-lg transition-all text-gray-900"
            />
          </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-[#ff77bc]  text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base md:text-lg"
            >
            {loading ? (
              <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 md:px-5 md:py-6 lg:px-8 lg:py-8 w-full">
      <header className="flex flex-col gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b-2 border-gray-200 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#f74c06] to-[#ff8c00] bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Generate Backup Button */}
            <button
              onClick={handleGenerateBackup}
              disabled={backupLoading}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {backupLoading ? "Generating..." : "Generate Backup"}
            </button>
            {/* Restore Backup Button */}
            <button
              onClick={() => setShowRestoreModal(true)}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Restore Backup
            </button>
            {/* Banner Button - Desktop Only */}
            <button
              onClick={() => setCurrentView("banners")}
              className={`hidden lg:flex px-4 md:px-6 py-2.5 md:py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 items-center justify-center gap-2 text-sm md:text-base ${
                currentView === "banners"
                  ? "bg-gradient-to-r from-[#f74c06] to-[#ff8c00] text-white"
                  : "bg-[#70d4fe] hover:bg-[#5bc5f0] text-white"
              }`}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Banners
            </button>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
          Logout
        </button>
          </div>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="flex gap-2 lg:hidden">
          <button
            onClick={() => {
              setCurrentView("products");
              setEditingId(null);
            }}
            className={`flex-1 px-3 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 text-sm ${
              currentView === "products"
                ? "bg-gradient-to-r from-[#f74c06] to-[#ff8c00] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Products
          </button>
          <button
            onClick={() => {
              if (editingId) {
                resetForm();
              }
              setCurrentView("add");
            }}
            className={`flex-1 px-3 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 text-sm ${
              currentView === "add"
                ? "bg-gradient-to-r from-[#f74c06] to-[#ff8c00] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
          <button
            onClick={() => {
              setCurrentView("banners");
            }}
            className={`flex-1 px-3 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 text-sm ${
              currentView === "banners"
                ? "bg-gradient-to-r from-[#f74c06] to-[#ff8c00] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Banners
          </button>
        </div>
      </header>

      <div
        className={`${
          currentView === "banners"
            ? "block"
            : "grid grid-cols-1 lg:grid-cols-2"
        } gap-3 md:gap-4 lg:gap-6 xl:gap-8`}
      >
        <section
          className={`bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto ${
            currentView === "add"
              ? "block"
              : currentView === "banners"
              ? "hidden"
              : "hidden lg:block"
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            {editingId ? "Edit Product" : "Add New Product"}
          </h3>
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm md:text-base">
              {error}
            </div>
          )}

          <div className="mb-4 md:mb-6 flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-[#f74c06] border-2 border-[#f74c06] rounded-lg font-semibold hover:bg-[#f74c06] hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={loading || imageUploading}
            >
              Reset Form
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Description:
              </label>
              <textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-y min-h-[100px] text-base md:text-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Category: <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
              >
                <option value="">Select Category</option>
                <option value="Rackets">Rackets</option>
                <option value="Shuttlecocks">Shuttlecocks</option>
                <option value="Strings">Strings</option>
                <option value="Grips">Grips</option>
                <option value="Bags">Bags</option>
                <option value="Shoes">Shoes</option>
                <option value="Clothing">Clothing</option>
                <option value="Headbands">Headbands</option>
                <option value="Wristbands">Wristbands</option>
              </select>
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Collection:
              </label>
              <select
                name="collection"
                value={formData.collection}
                onChange={(e) => {
                  if (e.target.value === "__ADD_NEW__") {
                    setShowAddCollection(true);
                  } else {
                    handleInputChange(e);
                    setShowAddCollection(false);
                  }
                }}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
              >
                <option value="">Select a collection</option>
                {collectionsList.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                <option
                  value="__ADD_NEW__"
                  className="font-semibold text-blue-600"
                >
                  + Add New Collection
                </option>
              </select>
              {showAddCollection && (
                <div className="mt-2 flex gap-2">
              <input
                type="text"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    placeholder="Enter new collection name"
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newCollection.trim()) {
                        e.preventDefault();
                        const trimmed = newCollection.trim();
                        if (!collectionsList.includes(trimmed)) {
                          setCollectionsList([...collectionsList, trimmed]);
                          setFormData({ ...formData, collection: trimmed });
                        }
                        setNewCollection("");
                        setShowAddCollection(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCollection.trim()) {
                        const trimmed = newCollection.trim();
                        if (!collectionsList.includes(trimmed)) {
                          setCollectionsList([...collectionsList, trimmed]);
                          setFormData({ ...formData, collection: trimmed });
                        }
                        setNewCollection("");
                        setShowAddCollection(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCollection(false);
                      setNewCollection("");
                    }}
                    className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Type:
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={(e) => {
                  if (e.target.value === "__ADD_NEW__") {
                    setShowAddType(true);
                  } else {
                    handleInputChange(e);
                    setShowAddType(false);
                  }
                }}
                disabled={!formData.category}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg text-gray-900"
              >
                <option value="">
                  {formData.category
                    ? "Select a type"
                    : "Select category first"}
                </option>

                {formData.category &&
                  categoryTypes[formData.category] &&
                  categoryTypes[formData.category].length > 0 && (
                  <optgroup label={`${formData.category} - Type`}>
                    {categoryTypes[formData.category].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </optgroup>
                  )}
                {formData.category && typesList[formData.category] && (
                  <optgroup label="Custom Types">
                    {typesList[formData.category].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </optgroup>
                )}
                {formData.category && (
                  <option
                    value="__ADD_NEW__"
                    className="font-semibold text-blue-600"
                  >
                    + Add New Type
                  </option>
                )}
              </select>
              {showAddType && formData.category && (
                <div className="mt-2 flex gap-2">
              <input
                type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter new type name"
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newType.trim()) {
                        e.preventDefault();
                        const trimmed = newType.trim();
                        const currentTypes = typesList[formData.category] || [];
                        if (
                          !currentTypes.includes(trimmed) &&
                          !categoryTypes[formData.category]?.includes(trimmed)
                        ) {
                          setTypesList({
                            ...typesList,
                            [formData.category]: [...currentTypes, trimmed],
                          });
                          setFormData({ ...formData, type: trimmed });
                        }
                        setNewType("");
                        setShowAddType(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newType.trim()) {
                        const trimmed = newType.trim();
                        const currentTypes = typesList[formData.category] || [];
                        if (
                          !currentTypes.includes(trimmed) &&
                          !categoryTypes[formData.category]?.includes(trimmed)
                        ) {
                          setTypesList({
                            ...typesList,
                            [formData.category]: [...currentTypes, trimmed],
                          });
                          setFormData({ ...formData, type: trimmed });
                        }
                        setNewType("");
                        setShowAddType(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddType(false);
                      setNewType("");
                    }}
                    className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Price: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                placeholder="Enter product price"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Product Discount (%):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="discount_percentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percentage || 0}
                  onChange={handleInputChange}
                  className="w-24 md:w-32 px-2 md:px-3 py-2 md:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm md:text-base text-gray-900"
                  placeholder="0"
                />
                <span className="text-sm md:text-base font-semibold text-gray-700">
                  Discounted Price: Rs.{" "}
                  <span className="text-green-600">
                    {Number(
                      (formData.price || 0) *
                        (1 - (formData.discount_percentage || 0) / 100)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Base price: Rs.{" "}
                {Number(formData.price || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Product Status:
              </label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.out_of_stock || false}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        out_of_stock: e.target.checked,
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#eab166]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-3 text-sm md:text-base font-medium text-gray-700">
                    {formData.out_of_stock
                      ? "Out of Stock (Override)"
                      : "In Stock"}
                  </span>
                </label>
                {formData.out_of_stock && (
                  <span className="text-sm md:text-base text-red-600 font-semibold">
                    ⚠️ All variants will show as out of stock
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs md:text-sm text-gray-500">
                Toggle this to temporarily mark the entire product as out of
                stock. This overrides all variant stock levels.
              </p>
            </div>

            {/* Payment Options */}
            <div className="border-t-2 border-gray-200 pt-4 md:pt-6">
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                Payment Options
              </h4>

              <div className="space-y-4">
                {/* Installment Months */}
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    Installment Months:
                  </label>
                  <input
                    type="number"
                    name="installment_months"
                    min="0"
                    max="12"
                    value={formData.installment_months || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                    placeholder="0 (no installments)"
                  />
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    Number of months for installment payment (e.g., 3 for 3
                    months)
                  </p>
                </div>

                {/* Payment Providers */}
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
                    Payment Providers:
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enable_mintpay || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            enable_mintpay: e.target.checked,
                          }));
                        }}
                        className="w-5 h-5 text-[#eab166] bg-gray-50 border-2 border-gray-300 rounded focus:ring-[#eab166] focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-3 text-sm md:text-base font-medium text-gray-700">
                        Enable Mintpay
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enable_koko || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            enable_koko: e.target.checked,
                          }));
                        }}
                        className="w-5 h-5 text-[#eab166] bg-gray-50 border-2 border-gray-300 rounded focus:ring-[#eab166] focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-3 text-sm md:text-base font-medium text-gray-700">
                        Enable KOKO
                      </span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs md:text-sm text-gray-500">
                    Select payment providers to display with installment options
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Colors: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  multiple
                  value={formData.selectedColors || []}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      selectedColors: selected,
                      // Initialize colorVariants for new colors
                      colorVariants: selected.reduce(
                        (acc, color) => {
                          if (!acc[color]) {
                            acc[color] = {
                              image_url: "",
                              discount_percentage: 0,
                              sizes: {},
                              grip_sizes: {},
                            };
                          }
                          return acc;
                        },
                        { ...prev.colorVariants }
                      ),
                    }));
                  }}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm md:text-base lg:text-lg text-gray-900 min-h-[100px] md:min-h-[120px]"
                  size="4"
                >
                  {colorsList.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddColor(true)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    + Add New Color
                  </button>
                  <p className="text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple colors
                  </p>
                </div>
                {showAddColor && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCollection}
                      onChange={(e) => setNewCollection(e.target.value)}
                      placeholder="Enter new color name"
                      className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newCollection.trim()) {
                          e.preventDefault();
                          const trimmed = newCollection.trim();
                          if (!colorsList.includes(trimmed)) {
                            setColorsList([...colorsList, trimmed]);
                            setFormData((prev) => ({
                              ...prev,
                              selectedColors: [...prev.selectedColors, trimmed],
                              colorVariants: {
                                ...prev.colorVariants,
                                [trimmed]: {
                                  image_url: "",
                                  discount_percentage: 0,
                                  sizes: {},
                                  grip_sizes: {},
                                },
                              },
                            }));
                          }
                          setNewCollection("");
                          setShowAddCollection(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCollection.trim()) {
                          const trimmed = newCollection.trim();
                          if (!colorsList.includes(trimmed)) {
                            setColorsList([...colorsList, trimmed]);
                            setFormData((prev) => ({
                              ...prev,
                              selectedColors: [...prev.selectedColors, trimmed],
                              colorVariants: {
                                ...prev.colorVariants,
                                [trimmed]: {
                                  image_url: "",
                                  discount_percentage: 0,
                                  sizes: {},
                                  grip_sizes: {},
                                },
                              },
                            }));
                          }
                          setNewCollection("");
                          setShowAddCollection(false);
                        }
                      }}
                      className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCollection(false);
                        setNewCollection("");
                      }}
                      className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {formData.selectedColors &&
                  formData.selectedColors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
                      {(formData.selectedColors || []).map((color) => (
                        <span
                          key={color}
                          className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2"
                        >
                          <span className="truncate max-w-[100px] md:max-w-none">
                            {color}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => {
                                const newColorVariants = {
                                  ...prev.colorVariants,
                                };
                                delete newColorVariants[color];
                                return {
                                  ...prev,
                                  selectedColors: prev.selectedColors.filter(
                                    (c) => c !== color
                                  ),
                                  colorVariants: newColorVariants,
                                };
                              });
                            }}
                            className="text-red-600 hover:text-red-800 font-bold text-base md:text-lg flex-shrink-0"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div>
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Specifications
              </h4>
              <div className="border-2 border-gray-200 rounded-lg p-4 md:p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Spec name (e.g. 'Weight')"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 min-w-[150px] px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent bg-white text-base md:text-lg text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Spec value (e.g. '77g')"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 min-w-[150px] px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent bg-white text-base md:text-lg text-gray-900"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                    className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base whitespace-nowrap"
                >
                  Add Spec
                </button>
              </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                {Object.entries(formData.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white px-3 md:px-4 py-2 rounded-full flex items-center gap-2 md:gap-3 shadow-sm border border-gray-200"
                    >
                      <span className="font-semibold text-gray-700 text-sm md:text-base">
                        {key}:
                      </span>
                      <span className="text-gray-600 text-sm md:text-base">
                        {value}
                      </span>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                        className="w-5 h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Product Images
              </h4>
              <div className="border-2 border-gray-200 rounded-lg p-4 md:p-6 bg-gray-50">
                <div className="mb-4">
                <input
                  type="file"
                  id="product-image-upload"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      await handleProductImageUpload(
                        formData.name,
                        e.target.files[0]
                      );
                        e.target.value = "";
                    }
                  }}
                  disabled={imageUploading}
                    className="hidden"
                />
                <label
                  htmlFor="product-image-upload"
                    className="inline-block px-4 md:px-6 py-2.5 md:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {imageUploading
                    ? `Uploading... ${imageUploadProgress}%`
                    : "Upload Product Image"}
                </label>
                  <p className="mt-2 text-xs md:text-sm text-gray-600">
                  Upload general product images (front, side, details, etc.)
                </p>
              </div>

                <div className="flex flex-wrap gap-3 md:gap-4">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                      className={`relative w-20 h-20 md:w-24 md:h-24 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        index === mainImageIndex
                          ? "border-blue-500 border-4 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={`${API_BASE_URL}${image.image_url}`}
                      alt={`Product view ${index + 1}`}
                        className="w-full h-full object-cover"
                      onClick={() => setAsMainImage(index)}
                    />
                      <div className="absolute bottom-0 left-0 right-0 flex">
                      <button
                        type="button"
                        onClick={() => setAsMainImage(index)}
                        disabled={index === mainImageIndex}
                          className={`flex-1 py-1 text-xs text-white ${
                            index === mainImageIndex
                              ? "bg-blue-600 cursor-default"
                              : "bg-blue-500 hover:bg-blue-600"
                          } transition-colors`}
                        >
                          {index === mainImageIndex ? "Main" : "Set Main"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Color Variants
              </h4>
              {!formData.selectedColors ||
              formData.selectedColors.length === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 md:p-6 text-center">
                  <p className="text-yellow-800 font-semibold">
                    Please select at least one color above to configure
                    variants.
                  </p>
                  </div>
              ) : (
                (formData.selectedColors || []).map((color) => {
                  const colorVariant = formData.colorVariants[color] || {
                    image_url: "",
                    discount_percentage: 0,
                    sizes: {},
                    grip_sizes: {},
                  };

                  return (
                    <div
                      key={color}
                      className="bg-white p-3 md:p-4 lg:p-6 rounded-lg mb-3 md:mb-4 lg:mb-6 border-2 border-gray-200 shadow-sm relative pl-3 md:pl-4 lg:pl-6 border-l-4 border-l-[#f74c06]"
                    >
                      <h5 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-3 md:mb-4 lg:mb-6">
                        {color}
                      </h5>

                      {/* Image Upload */}
                      <div className="mb-4 md:mb-6">
                        <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                          Product Image for {color}:
                        </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                            handleColorImageUpload(
                              formData.name,
                              e.target.files[0],
                              color
                            )
                    }
                    disabled={imageUploading}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {colorVariant.image_url && (
                          <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <img
                              src={`${API_BASE_URL}${colorVariant.image_url}`}
                              alt={`${color} preview`}
                              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-300"
                            />
                            <span className="text-xs md:text-sm text-gray-600 break-all flex-1">
                              {colorVariant.image_url.split("/").pop()}
                            </span>
                    </div>
                  )}
                </div>

                      {/* Discount */}
                      <div className="mb-4 md:mb-6">
                        <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                          Discount (%):
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={colorVariant.discount_percentage || 0}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                colorVariants: {
                                  ...prev.colorVariants,
                                  [color]: {
                                    ...(prev.colorVariants[color] || {
                                      image_url: "",
                                      sizes: {},
                                      grip_sizes: {},
                                    }),
                                    discount_percentage:
                                      parseFloat(e.target.value) || 0,
                                  },
                                },
                              }));
                            }}
                            className="w-24 md:w-32 px-2 md:px-3 py-2 md:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm md:text-base text-gray-900"
                            placeholder="0"
                          />
                          <span className="text-sm md:text-base font-semibold text-gray-700">
                            Discounted Price: Rs.{" "}
                            <span className="text-green-600">
                              {Number(
                                (formData.price || 0) *
                                  (1 -
                                    (colorVariant.discount_percentage || 0) /
                                      100)
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </span>
                        </div>
                        <p className="mt-1 text-xs md:text-sm text-gray-500">
                          Base price: Rs.{" "}
                          {Number(formData.price || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {/* Sizes with Stock Toggles */}
                      {formData.category &&
                        categoryVariantFields[formData.category]?.showSize && (
                          <div className="mb-4 md:mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm md:text-base font-semibold text-gray-700">
                                Sizes:
                              </label>
                    <button
                      type="button"
                      onClick={() => {
                                  setShowAddSize({
                                    ...showAddSize,
                                    [color]: true,
                        });
                      }}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                                + Add Missing Size
                    </button>
                  </div>
                            <div
                              className={`grid gap-2 md:gap-3 ${
                                formData.category === "Shoes" ||
                                formData.category === "Rackets"
                                  ? "grid-cols-2 sm:grid-cols-3"
                                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                              }`}
                            >
                              {(formData.category === "Shoes" && sizesList.Shoes
                                ? sizesList.Shoes
                                : (formData.category === "Clothing" ||
                                    formData.category === "Bags" ||
                                    formData.category === "Headbands" ||
                                    formData.category === "Wristbands") &&
                                  sizesList[formData.category]
                                ? sizesList[formData.category]
                                : []
                              ).map((size) => {
                                const stock = colorVariant.sizes?.[size] || 0;
                                return (
                                  <div
                                    key={size}
                                    className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 border-2 border-gray-200 rounded-lg"
                                  >
                                    <span className="flex-1 text-xs md:text-sm font-semibold text-gray-700 truncate">
                                {size}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          colorVariants: {
                                            ...prev.colorVariants,
                                            [color]: {
                                              ...(prev.colorVariants[color] || {
                                                image_url: "",
                                                discount_percentage: 0,
                                                sizes: {},
                                                grip_sizes: {},
                                              }),
                                              sizes: {
                                                ...(prev.colorVariants[color]
                                                  ?.sizes || {}),
                                                [size]: stock > 0 ? 0 : 1,
                                              },
                                            },
                                          },
                                        }));
                                      }}
                                      className={`px-2 md:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                                        stock > 0
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {stock > 0 ? "In" : "Out"}
                                    </button>
                    </div>
                                );
                              })}
                </div>
                            {showAddSize[color] && (
                              <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                                  value={newSize[color] || ""}
                                  onChange={(e) =>
                                    setNewSize({
                                      ...newSize,
                                      [color]: e.target.value,
                                    })
                                  }
                                  placeholder="Enter new size"
                                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                                  onKeyPress={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      newSize[color]?.trim()
                                    ) {
                                      e.preventDefault();
                                      const trimmed = newSize[color].trim();
                                      const categorySizes =
                                        sizesList[formData.category] || [];
                                      if (!categorySizes.includes(trimmed)) {
                                        setSizesList({
                                          ...sizesList,
                                          [formData.category]: [
                                            ...categorySizes,
                                            trimmed,
                                          ],
                                        });
                                      }
                                      setNewSize({ ...newSize, [color]: "" });
                                      setShowAddSize({
                                        ...showAddSize,
                                        [color]: false,
                                      });
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newSize[color]?.trim()) {
                                      const trimmed = newSize[color].trim();
                                      const categorySizes =
                                        sizesList[formData.category] || [];
                                      if (!categorySizes.includes(trimmed)) {
                                        setSizesList({
                                          ...sizesList,
                                          [formData.category]: [
                                            ...categorySizes,
                                            trimmed,
                                          ],
                                        });
                                      }
                                      setNewSize({ ...newSize, [color]: "" });
                                      setShowAddSize({
                                        ...showAddSize,
                                        [color]: false,
                                      });
                                    }
                                  }}
                                  className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddSize({
                                      ...showAddSize,
                                      [color]: false,
                                    });
                                    setNewSize({ ...newSize, [color]: "" });
                                  }}
                                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                    </div>
                  )}
                  </div>
                        )}

                      {/* Grip Sizes with Stock Toggles */}
                      {formData.category &&
                        categoryVariantFields[formData.category]
                          ?.showGripSize && (
                          <div className="mb-4 md:mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm md:text-base font-semibold text-gray-700">
                                {categoryVariantFields[formData.category]
                                  ?.gripSizeLabel || "Grip Sizes"}
                                :
                              </label>
                  <button
                    type="button"
                                onClick={() => {
                                  setShowAddGripSize({
                                    ...showAddGripSize,
                                    [color]: true,
                                  });
                                }}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
                              >
                                + Add Missing{" "}
                                {categoryVariantFields[formData.category]
                                  ?.gripSizeLabel || "Grip Size"}
                  </button>
                            </div>
                            <div
                              className={`grid gap-2 md:gap-3 ${
                                formData.category === "Rackets"
                                  ? "grid-cols-2 sm:grid-cols-3"
                                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                              }`}
                            >
                              {(formData.category === "Rackets" &&
                              gripSizesList.Rackets
                                ? gripSizesList.Rackets
                                : formData.category === "Shuttlecocks" &&
                                  gripSizesList.Shuttlecocks
                                ? gripSizesList.Shuttlecocks.map((s) => s.value)
                                : []
                              ).map((gripSize) => {
                                const stock =
                                  colorVariant.grip_sizes?.[gripSize] || 0;
                                return (
                                  <div
                                    key={gripSize}
                                    className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 border-2 border-gray-200 rounded-lg"
                                  >
                                    <span className="flex-1 text-xs md:text-sm font-semibold text-gray-700 truncate">
                                      {gripSize}
                                    </span>
                    <button
                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          colorVariants: {
                                            ...prev.colorVariants,
                                            [color]: {
                                              ...(prev.colorVariants[color] || {
                                                image_url: "",
                                                discount_percentage: 0,
                                                sizes: {},
                                                grip_sizes: {},
                                              }),
                                              grip_sizes: {
                                                ...(prev.colorVariants[color]
                                                  ?.grip_sizes || {}),
                                                [gripSize]: stock > 0 ? 0 : 1,
                                              },
                                            },
                                          },
                                        }));
                                      }}
                                      className={`px-2 md:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                                        stock > 0
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {stock > 0 ? "In" : "Out"}
                    </button>
                </div>
                                );
                              })}
              </div>
                            {showAddGripSize[color] && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={newGripSize[color] || ""}
                                  onChange={(e) =>
                                    setNewGripSize({
                                      ...newGripSize,
                                      [color]: e.target.value,
                                    })
                                  }
                                  placeholder={`Enter new ${
                                    categoryVariantFields[
                                      formData.category
                                    ]?.gripSizeLabel?.toLowerCase() ||
                                    "grip size"
                                  }`}
                                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 focus:bg-white transition-all text-base md:text-lg text-gray-900"
                                  onKeyPress={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      newGripSize[color]?.trim()
                                    ) {
                                      e.preventDefault();
                                      const trimmed = newGripSize[color].trim();
                                      const categoryGripSizes =
                                        gripSizesList[formData.category];
                                      if (
                                        formData.category === "Rackets" &&
                                        Array.isArray(categoryGripSizes)
                                      ) {
                                        if (
                                          !categoryGripSizes.includes(trimmed)
                                        ) {
                                          setGripSizesList({
                                            ...gripSizesList,
                                            [formData.category]: [
                                              ...categoryGripSizes,
                                              trimmed,
                                            ],
                                          });
                                        }
                                      } else if (
                                        formData.category === "Shuttlecocks" &&
                                        Array.isArray(categoryGripSizes)
                                      ) {
                                        const exists = categoryGripSizes.some(
                                          (s) =>
                                            s.value === trimmed ||
                                            s.label.includes(trimmed)
                                        );
                                        if (!exists && !isNaN(trimmed)) {
                                          const newSpeed = {
                                            value: trimmed,
                                            label: `${trimmed} (Custom)`,
                                          };
                                          setGripSizesList({
                                            ...gripSizesList,
                                            [formData.category]: [
                                              ...categoryGripSizes,
                                              newSpeed,
                                            ],
                                          });
                                        }
                                      }
                                      setNewGripSize({
                                        ...newGripSize,
                                        [color]: "",
                                      });
                                      setShowAddGripSize({
                                        ...showAddGripSize,
                                        [color]: false,
                                      });
                                    }
                                  }}
                                />
            <button
              type="button"
                                  onClick={() => {
                                    if (newGripSize[color]?.trim()) {
                                      const trimmed = newGripSize[color].trim();
                                      const categoryGripSizes =
                                        gripSizesList[formData.category];
                                      if (
                                        formData.category === "Rackets" &&
                                        Array.isArray(categoryGripSizes)
                                      ) {
                                        if (
                                          !categoryGripSizes.includes(trimmed)
                                        ) {
                                          setGripSizesList({
                                            ...gripSizesList,
                                            [formData.category]: [
                                              ...categoryGripSizes,
                                              trimmed,
                                            ],
                                          });
                                        }
                                      } else if (
                                        formData.category === "Shuttlecocks" &&
                                        Array.isArray(categoryGripSizes)
                                      ) {
                                        const exists = categoryGripSizes.some(
                                          (s) =>
                                            s.value === trimmed ||
                                            s.label.includes(trimmed)
                                        );
                                        if (!exists && !isNaN(trimmed)) {
                                          const newSpeed = {
                                            value: trimmed,
                                            label: `${trimmed} (Custom)`,
                                          };
                                          setGripSizesList({
                                            ...gripSizesList,
                                            [formData.category]: [
                                              ...categoryGripSizes,
                                              newSpeed,
                                            ],
                                          });
                                        }
                                      }
                                      setNewGripSize({
                                        ...newGripSize,
                                        [color]: "",
                                      });
                                      setShowAddGripSize({
                                        ...showAddGripSize,
                                        [color]: false,
                                      });
                                    }
                                  }}
                                  className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                  Add
            </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddGripSize({
                                      ...showAddGripSize,
                                      [color]: false,
                                    });
                                    setNewGripSize({
                                      ...newGripSize,
                                      [color]: "",
                                    });
                                  }}
                                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-white text-[#f74c06] border-2 border-[#f74c06] rounded-lg font-semibold hover:bg-[#f74c06] hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
                disabled={loading || imageUploading}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="flex-1 px-4 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base md:text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : editingId ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          className={`bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 ${
            currentView === "products"
              ? "block"
              : currentView === "banners"
              ? "hidden"
              : "hidden lg:block"
          }`}
        >
          <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 md:py-3 border-2 border-[#f74c06] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f74c06] focus:ring-opacity-30 bg-white text-base md:text-lg text-gray-900"
            />
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2.5 md:py-3 border-2 border-[#f74c06] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f74c06] focus:ring-opacity-30 bg-white text-base md:text-lg text-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-[#f74c06] border-2 border-[#f74c06] rounded-lg font-semibold hover:bg-[#f74c06] hover:text-white transform hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
            >
              Clear Filters
            </button>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            Product List
          </h3>
          {loading && !products.length ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block w-8 h-8 md:w-10 md:h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-500">
              <svg
                className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 fill-gray-300"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-lg md:text-xl">No products found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          ID: {product.id}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span>{" "}
                          {product.category}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Variants:</span>{" "}
                          {product.variants ? product.variants.length : 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => editProduct(product)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          toggleOutOfStock(product.id, product.out_of_stock)
                        }
                        className={`w-full px-4 py-2.5 font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                          product.out_of_stock
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                            : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {product.out_of_stock ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          )}
                        </svg>
                        {product.out_of_stock ? "Out of Stock" : "In Stock"}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 md:px-6 md:py-3.5 text-left text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-3 py-3 md:px-6 md:py-3.5 text-left text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 py-3 md:px-6 md:py-3.5 text-left text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider hidden sm:table-cell">
                            Category
                          </th>
                          <th className="px-3 py-3 md:px-6 md:py-3.5 text-left text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Actions
                          </th>
                </tr>
              </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product, index) => (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-gray-900 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm md:text-base text-gray-900 max-w-xs truncate">
                              {product.name}
                            </td>
                            <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-gray-500 hidden sm:table-cell">
                              {product.category}
                            </td>
                            <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base">
                              <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => editProduct(product)}
                                  className="px-3 md:px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 text-xs md:text-sm"
                                >
                                  <svg
                                    className="w-3 h-3 md:w-4 md:h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                        Edit
                      </button>
                                <button
                                  onClick={() =>
                                    toggleOutOfStock(
                                      product.id,
                                      product.out_of_stock
                                    )
                                  }
                                  className={`px-3 md:px-5 py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 text-xs md:text-sm ${
                                    product.out_of_stock
                                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                      : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                  }`}
                                >
                                  <svg
                                    className="w-3 h-3 md:w-4 md:h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    {product.out_of_stock ? (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    ) : (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    )}
                                  </svg>
                                  {product.out_of_stock
                                    ? "Out of Stock"
                                    : "In Stock"}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                                  className="px-3 md:px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 text-xs md:text-sm"
                                >
                                  <svg
                                    className="w-3 h-3 md:w-4 md:h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                        Delete
                      </button>
                              </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Banner Management Section */}
        {currentView === "banners" && (
          <section className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 w-full block">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                Manage Promotional Banners
              </h3>
              <button
                onClick={() => {
                  setCurrentView("products");
                  setEditingId(null);
                }}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-[#70d4fe] hover:bg-[#5bc5f0] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Admin Panel
              </button>
            </div>

            {/* Add Banner */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                Add New Banner Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerImageUpload}
                disabled={bannerImageUploading}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eab166] focus:border-transparent bg-gray-50 text-gray-900 text-sm md:text-base"
              />
              {bannerImageUploading && (
                <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              )}
            </div>

            {/* Banner List */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">
                Current Banners ({banners.length})
              </h4>
              {banners.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No banners added yet. Upload an image above to get started.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="border-2 border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="relative w-full h-48 md:h-64 bg-gray-100">
                        <img
                          src={`${API_BASE_URL}${banner.image_url}`}
                          alt={`Banner ${banner.id}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 md:p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm text-gray-600">
                            Order: {banner.display_order}
                          </span>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-xs md:text-sm flex items-center gap-1.5"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Restore Backup Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Restore Backup
                </h3>
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setRestoreFile(null);
                    setError("");
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Excel Backup File (.xlsx or .xls):
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file extension
                      const fileName = file.name.toLowerCase();
                      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                        setError("Please select a valid Excel file (.xlsx or .xls). If your file doesn't have an extension, please rename it to end with .xlsx");
                        setRestoreFile(null);
                        return;
                      }
                      setRestoreFile(file);
                      setError("");
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {restoreFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Selected: <span className="font-semibold">{restoreFile.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {(restoreFile.size / 1024).toFixed(2)} KB
                      {!restoreFile.name.toLowerCase().endsWith('.xlsx') && !restoreFile.name.toLowerCase().endsWith('.xls') && (
                        <span className="text-red-600 ml-2">⚠️ File should have .xlsx or .xls extension</span>
                      )}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  💡 Tip: If your downloaded backup file doesn't have a .xlsx extension, rename it to end with .xlsx before uploading.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Restoring a backup will delete all existing products and replace them with the products from the backup file. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setRestoreFile(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreBackup}
                  disabled={!restoreFile || restoreLoading}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {restoreLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Restoring...
                    </>
                  ) : (
                    "Restore Backup"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
