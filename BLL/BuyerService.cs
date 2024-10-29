using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class BuyerService
    {
        static BuyerService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }
        public static void Create(BuyerModel b)
        {
            var data = Mapper.Map<Buyer>(b);
            DataSupplier.BuyerDataAccess().Add(data);
        }

        public static void Edit(BuyerModel b)
        {
            var data = Mapper.Map<Buyer>(b);
            DataSupplier.BuyerDataAccess().Edit(data);
        }

        public static void Delete(string id)
        {
            DataSupplier.BuyerDataAccess().Delete(id);
        }

        public static List<BuyerModel> Get()
        {
            var data = Mapper.Map<List<BuyerModel>>(DataSupplier.BuyerDataAccess().Get());
            return data;
        }
        public static BuyerModel Get(string id)
        {

            var data = Mapper.Map<BuyerModel>(DataSupplier.BuyerDataAccess().Get(id));
            return data;
        }
    }
}
