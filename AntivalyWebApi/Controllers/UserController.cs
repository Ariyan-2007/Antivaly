using AntivalyWebApi.Auth;
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
    [CustomAuth]
    public class UserController : ApiController
    {
        [Route("api/user/profile/{id}")]
        [HttpGet]
        public HttpResponseMessage Get(string id)
        {
            var d = UserService.Get(id);
            if (d != null)
                return Request.CreateResponse(HttpStatusCode.OK, d);
            else
                return Request.CreateResponse(HttpStatusCode.NotFound, "Empty");
        }
    }
}
