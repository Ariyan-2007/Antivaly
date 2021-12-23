using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BEL
{
    public class TokenModel
    {
        public int Id { get; set; }
        public string UserID { get; set; }
        public string AccStatus { get; set; }
        public string AccessToken { get; set; }
        public System.DateTime CreatedAt { get; set; }
        public Nullable<System.DateTime> ExpiredAt { get; set; }
    }
}
