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
    public class DeliveryService
    {
        static DeliveryService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }

        public static void Create(DeliveryModel b)
        {
            var data = Mapper.Map<Delivery>(b);
            DataSupplier.DeliveryDataAccess().Add(data);
        }

        public static void Edit(DeliveryModel b)
        {
            var data = Mapper.Map<Delivery>(b);
            DataSupplier.DeliveryDataAccess().Edit(data);
        }

        public static void Delete(string id)
        {
            DataSupplier.DeliveryDataAccess().Delete(id);
        }

        public static List<DeliveryModel> Get()
        {
            var data = Mapper.Map<List<DeliveryModel>>(DataSupplier.DeliveryDataAccess().Get());
            return data;
        }
        public static DeliveryModel Get(string id)
        {
            var data = Mapper.Map<DeliveryModel>(DataSupplier.DeliveryDataAccess().Get(id));
            return data;
        }
    }
}
