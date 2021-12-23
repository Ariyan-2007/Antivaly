using AntivalyWebApi.Auth;
using BLL;
using BEL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace AntivalyWebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    [CustomAuth]
    public class AdminController : ApiController
    {
        
        [Route("api/user/userlist")]
        [HttpGet]
        public HttpResponseMessage Get()
        {
            var d = UserService.Get();
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }

        [Route("api/user/deliverydetails")]
        [HttpGet]
        public HttpResponseMessage GetDetails()
        {
            var d = DeliveryService.Get();
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }

        [Route("api/user/productdetails")]
        [HttpGet]
        public HttpResponseMessage GetProductDetails()
        {
            var d = ProductService.Get();
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Products unavailable");
        }

        [Route("api/user/currentlyLogged")]
        [HttpGet]
        public HttpResponseMessage GetLoginDetails()
        {
            var d = TokenService.Get();
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "No Active Users");
        }

        [Route("api/user/{uid}")]
        [HttpGet]
        public HttpResponseMessage Get(string uid)
        {
            var d = UserService.Get(uid);
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "User unavailable");
        }

        [Route("api/user/control/{uid}/{AccStatus}")]
        [HttpPost]
        public HttpResponseMessage Change(string uid, string AccStatus)
        {

            if (UserService.Change(uid, AccStatus))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Status Succesfully Changed");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Operation Failed");
        }

        [Route("api/product/delete/{id}")]
        [HttpPost]
        public HttpResponseMessage DeleteProduct(int id)
        {
            if(ProductService.Delete(id))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Product Deleted");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Product Deletion Failed");
        }

        [Route("api/user/adminProfile/edit")]
        [HttpPost]
        public HttpResponseMessage EditProfile(UserModel user)
        {
            if(UserService.Edit(user))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Profile Edited Successfully");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Profile Edit Failed");
        }

        [Route("api/coupon/addCoupon")]
        [HttpPost]
        public HttpResponseMessage AddCoupon(CouponModel coupon)
        {

            if (CouponService.Create(coupon))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Coupon Successfully Created");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Coupon Creation Failed");
        }

        [Route("api/coupon/removeCoupon/{code}")]
        [HttpPost]
        public HttpResponseMessage RemoveCoupon(string code)
        {

            if (CouponService.Delete(code))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Coupon Removed");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Coupon Removal Failed");
        }

        [Route("api/coupon/showCoupon")]
        [HttpGet]
        public HttpResponseMessage ShowCoupon()
        {
            var d = CouponService.Get();
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "No Coupons To Show");
        }


    }
}
