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

    public class RegistrationController : ApiController
    {
        [Route("api/UserID/LastID")]
        [HttpGet]
        public HttpResponseMessage Get()
        {
            var id = UserIdService.Get();
            if (id != null)
                return Request.CreateResponse(HttpStatusCode.OK, id);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }
        [Route("api/register")]
        [HttpPost]
        public HttpResponseMessage Registration(UserModel userModel)
        {
            
            if (UserService.Registration(userModel))
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Registration Successful");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Registration Failed");
        }
        [Route("api/coupon")]
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
