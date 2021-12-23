using AntivalyWebApi.Auth;
using BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Script.Serialization;

namespace AntivalyWebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    [CustomAuth]
    public class _BuyerController : ApiController
    {
        [Route("api/buyer/home")]
        [HttpGet]
        public HttpResponseMessage Get()
        {
            var d = ProductService.Get();
            if(d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }
        [Route("api/buyer/home/{id}")]
        [HttpGet]
        public HttpResponseMessage Get(int id)
        {
            var d = ProductService.Get(id);
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }

        [Route("api/buyer/home/category/{s}")]
        [HttpGet]
        public HttpResponseMessage GetProductByCategory(string s)
        {
            var d = ProductService.GetProductByCategory(s);
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }

        [Route("api/buyer/home/product/{s}")]
        [HttpGet]
        public HttpResponseMessage GetProductByProduct(string s)
        {
            var d = ProductService.GetProductByProduct(s);
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }

        [Route("api/buyer/placeOrder/{list}/{id}")]
        [HttpPost]
        public HttpResponseMessage PlaceOrder(string list, string id)
        {
            TransactionService.PlaceOrder(list, id);
            if(list != "")
                return Request.CreateResponse(HttpStatusCode.OK, "Order placed.");
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty cart!");
        }

    }
}
