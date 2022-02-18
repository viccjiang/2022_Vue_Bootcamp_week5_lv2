//匯入都寫在前面
import pagination from './pagination.js';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({ // 用來做一些設定
  generateMessage: localize('zh_TW'), //啟用 locale 
});

// 加入站點
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
// 加入路徑
const apiPath = 'jiangs2022vue3';

const app = Vue.createApp({
  data() {
    return {
      products: [],
      cartData: {
        carts:{},
      },
      productId: '',
      isLoadingItem: '',
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      pagination: {},
    };
  },
  components: {
    pagination,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    getProducts(page = 1) {
      axios.get(`${apiUrl}/api/${apiPath}/products/?page=${page}`)
        .then((res) => {
          console.log(res);
          this.products = res.data.products;
          // console.log(this.products);
          // 取出分頁資訊
          this.pagination = res.data.pagination;
        });
    },
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          console.log(res);
          this.cartData = res.data.data;
          // console.log(this.cartData);
        });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then((res) => {
          console.log(res);
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = '';
        })
    },
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          console.log(res);
          this.getCart();
          this.isLoadingItem = '';
        })
    },
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
        .then((res) => {
          console.log(res);
          this.getCart();
          this.isLoadingItem = '';
        })
    },
    deleteAllCarts() {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios.delete(url).then((response) => {
        alert(response.data.message);
        this.getCart();
      }).catch((err) => {
        // console.dir(err);
        alert(err.data.message);
      });
    },
    createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios.post(url, { data: order }).then((response) => {
        alert(response.data.message);
        this.$refs.form.resetForm();
        this.getCart();
      }).catch((err) => {
        alert(err.data.message);
      });
    },

  },
  mounted() {
    this.getProducts();
    this.getCart();

  },
})

// $refs
app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    }
  },
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          console.log(res);
          this.product = res.data.product;
          // console.log(this.products);
        });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty)
    },

  },
  mounted() {
    // ref = "modal"
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});



app.mount('#app');




