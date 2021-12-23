using BEL;
using BLL;
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
    public class AuthController : ApiController
    {
        [Route("api/login")]
        [HttpPost]
        public HttpResponseMessage Auth(UserModel user)
        {
            var data = AuthService.Auth(user);
            if (data != null)
            {
                return Request.CreateResponse(HttpStatusCode.OK, data);
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "User not found");
        }

        [Route("api/logout/{id}")]
        [HttpGet]
        public HttpResponseMessage logout(string id)
        {
            var data = AuthService.Logout(id);
            if (data)
            {
                return Request.CreateResponse(HttpStatusCode.OK, "Successfully logged-out.");
            }
            return Request.CreateResponse(HttpStatusCode.NotFound, "Already logged-out!");
        }
    }
}
