using System;
using BLL;
using BEL;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using AntivalyWebApi.Auth;

namespace AntivalyWebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    [CustomAuth]
    public class SellerController : ApiController
    {
        [Route("api/product/addProduct")]
        [HttpPost]
        public HttpResponseMessage AddProduct(ProductModel product)
        {
            ProductService.Create(product);
            if (product != null)
                return Request.CreateResponse(HttpStatusCode.OK, "Product added.");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Product add failed");
        }
        [Route("api/product/editProduct")]
        [HttpPost]
        public HttpResponseMessage EditProduct(ProductModel product)
        {
            ProductService.Edit(product);
            if (product != null)
                return Request.CreateResponse(HttpStatusCode.OK, "Product Edited.");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Product Edit failed");
        }
        [Route("api/product/deleteProduct/{id}")]
        [HttpGet]
        public HttpResponseMessage DeleteProduct(int id)
        {
            
            if (ProductService.Delete(id))
                return Request.CreateResponse(HttpStatusCode.OK, "Product deleted.");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Product deletion failed");
        }
        [Route("api/product/showAllProduct")]
        [HttpGet]
        public HttpResponseMessage ShowAllProduct()
        {
            var data = ProductService.Get();
            if (data != null)
                return Request.CreateResponse(HttpStatusCode.OK, data);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Products Unavailable");
        }

        [Route("api/product/showAllHiddenProduct")]
        [HttpGet]
        public HttpResponseMessage ShowAllHiddenProduct()
        {
            var data = ProductService.GetAllHiddenProducts();
            if (data != null)
                return Request.CreateResponse(HttpStatusCode.OK, data);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "No hidden products available");
        }

        [Route("api/product/hideProduct/{id}")]
        [HttpGet]
        public HttpResponseMessage HideProduct(int id)
        {
            if(ProductService.HideProduct(id))
                return Request.CreateResponse(HttpStatusCode.OK, "Product hidden succesfully");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Product cannot be hidden");
        }
        [Route("api/product/unhideProduct/{id}")]
        [HttpGet]
        public HttpResponseMessage UnhideProduct(int id)
        {
            if (ProductService.ExhibitProduct(id))
                return Request.CreateResponse(HttpStatusCode.OK, "Product hidden succesfully");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Product cannot be hidden");
        }
    }
}
