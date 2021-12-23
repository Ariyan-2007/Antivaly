using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class TokenRepo: IRepository<Token, string>
    {
        AntivalyEntities db;

        public TokenRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Token e)
        {
            this.db.Tokens.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var token = db.Tokens.FirstOrDefault(c => c.AccessToken == id);
            db.Tokens.Remove(token);
            db.SaveChanges();
        }

        public void Edit(Token e)
        {
            var t = db.Tokens.FirstOrDefault(en => en.Id == e.Id);
            db.Entry(t).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Token> Get()
        {
            return db.Tokens.ToList();
        }

        public Token Get(string id)
        {
            return db.Tokens.FirstOrDefault(c => c.AccessToken == id);
        }
    }
}
